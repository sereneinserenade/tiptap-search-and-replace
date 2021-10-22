import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Node as ProsemirrorNode } from 'prosemirror-model'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    search: {
      /**
       * Find text in editor
       */
      setSearchTerm: (searchTerm: string) => ReturnType,
      setReplaceTerm: (replaceTerm: string) => ReturnType,
      replace: () => ReturnType,
      replaceAll: () => ReturnType,
    }
  }
}

interface Result {
  from: number;
  to: number;
}

interface SearchOptions {
  searchTerm: string;
  replaceTerm: string;
  results: Result[]
}

interface TextNodesWithPosition {
  text: string;
  pos: number;
}

const updateView = (state: EditorState<any>, dispatch: any) => dispatch(state.tr)

const regex = (s: string): RegExp => new RegExp(s, "gi")

function processSearches(doc: ProsemirrorNode, searchTerm: RegExp): { decorationsToReturn: DecorationSet, results: Result[] } {
  const decorations: Decoration[] = []
  let textNodesWithPosition: TextNodesWithPosition[] = []
  const results: Result[] = [];

  let index = 0;

  if (!searchTerm) return { decorationsToReturn: DecorationSet.empty, results: [] }

  doc?.descendants((node, pos) => {
    if (node.isText) {
      if (textNodesWithPosition[index]) {
        textNodesWithPosition[index] = {
          text: textNodesWithPosition[index].text + node.text,
          pos: textNodesWithPosition[index].pos
        }
      } else {
        textNodesWithPosition[index] = {
          text: `${node.text}`,
          pos
        }
      }
    } else {
      index += 1
    }
  });

  textNodesWithPosition = textNodesWithPosition.filter(Boolean)

  for (let i = 0; i < textNodesWithPosition.length; i++) {
    const { text, pos } = textNodesWithPosition[i]

    let m;
    while ((m = searchTerm.exec(text))) {
      if (m[0] === "") break

      results.push({
        from: pos + m.index,
        to: pos + m.index + m[0].length,
      })
    }
  }


  results.forEach(r => decorations.push(Decoration.inline(r.from, r.to, { class: "search-result" })))

  return {
    decorationsToReturn: DecorationSet.create(doc, decorations),
    results
  }
}

const replace = (replaceTerm: string, results: Result[], { state, dispatch }: any) => {
  const firstResult = results[0]

  if (!firstResult) return

  const { from, to } = results[0]

  if (dispatch) dispatch(state.tr.insertText(replaceTerm, from, to))
}

const rebaseNextResult = (replaceTerm: string, index: number, lastOffset: number, results: Result[]): [number, Result[]] | null => {
  const nextIndex = index + 1

  if (!results[nextIndex]) return null

  const { from: currentFrom, to: currentTo } = results[index]

  const offset = (currentTo - currentFrom - replaceTerm.length) + lastOffset

  const { from, to } = results[nextIndex]

  results[nextIndex] = {
    to: to - offset,
    from: from - offset,
  }

  return [offset, results]
}

const replaceAll = (replaceTerm: string, results: Result[], { tr, dispatch }: any) => {
  let offset = 0;

  let ourResults = results.slice();

  if (!ourResults.length) return

  for (let i = 0; i < ourResults.length; i++) {
    const { from, to } = ourResults[i];

    tr.insertText(replaceTerm, from, to)

    const rebaseNextResultResponse = rebaseNextResult(replaceTerm, i, offset, ourResults)

    if (rebaseNextResultResponse) {
      offset = rebaseNextResultResponse[0]
      ourResults = rebaseNextResultResponse[1]
    }
  }

  dispatch(tr)
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const Search = Extension.create({
  name: 'search',

  defaultOptions: {
    searchTerm: '',
    replaceTerm: '',
    results: [],
  } as SearchOptions,

  addCommands() {
    return {
      setSearchTerm: (searchTerm: string) => ({ state, dispatch }) => {
        this.options.searchTerm = searchTerm
        this.options.results = []

        updateView(state, dispatch)

        return false
      },
      setReplaceTerm: (replaceTerm: string) => ({ state, dispatch }) => {
        this.options.replaceTerm = replaceTerm
        this.options.results = []

        updateView(state, dispatch)

        return false
      },
      replace: () => ({ state, dispatch }) => {
        const { replaceTerm, results } = this.options

        replace(replaceTerm, results, { state, dispatch })

        this.options.results.shift()

        updateView(state, dispatch)

        return false
      },
      replaceAll: () => ({ state, tr, dispatch }) => {
        const { replaceTerm, results } = this.options

        replaceAll(replaceTerm, results, { tr, dispatch })

        this.options.results = []

        updateView(state, dispatch)

        return false
      }
    }
  },

  addProseMirrorPlugins() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const oldThis = this;

    return [
      new Plugin({
        key: new PluginKey('search'),
        state: {
          init() {
            return DecorationSet.empty
          },
          apply({ doc, docChanged }) {
            const { searchTerm } = oldThis.options

            if (docChanged || searchTerm) {
              const { decorationsToReturn, results } = processSearches(doc, regex(searchTerm))

              oldThis.options.results = results

              return decorationsToReturn
            } else {
              return DecorationSet.empty
            }
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
