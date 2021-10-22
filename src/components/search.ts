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

export interface SearchStorage {
  searchTerm: string,
  replaceTerm: string,
  showSearchTerms: boolean,
  decorations: any[],
}

const updateView = (state: EditorState<any>, dispatch: any) => dispatch(state.tr)

const regex = (s: string): RegExp => new RegExp(s, "gi")

function processSearches(doc: ProsemirrorNode, searchTerm: RegExp) {
  const decorations: any[] = []
  let mergedTextNodes: any[] = []
  const results: any[] = [];

  let index = 0;

  if (!searchTerm) return

  doc?.descendants((node, pos) => {
    if (node.isText) {
      if (mergedTextNodes[index]) {
        mergedTextNodes[index] = {
          text: mergedTextNodes[index].text + node.text,
          pos: mergedTextNodes[index].pos
        }
      } else {
        mergedTextNodes[index] = {
          text: node.text,
          pos
        }
      }
    } else {
      index += 1
    }
  });

  mergedTextNodes = mergedTextNodes.filter(Boolean)

  for (let i = 0; i < mergedTextNodes.length; i++) {
    const { text, pos } = mergedTextNodes[i]

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

const replace = (replaceTerm: string, results: any[], { state, dispatch }: any) => {
  const firstResult = results[0]

  if (!firstResult) return

  const { from, to } = results[0]

  if (dispatch) dispatch(state.tr.insertText(replaceTerm, from, to))
}

const rebaseNextResult = (replaceTerm: string, index: number, lastOffset = 0, results: any[]): [number, any[]] | null => {
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

const replaceAll = (replaceTerm: string, results: any[], { tr, dispatch }: any) => {
  let offset: number;

  if (!results.length) return

  for (let i = 0; i < results.length; i++) {
    const { from , to } = results[i];
    
    tr.insertText(replace, from, to)

    const rebaseNextResultResponse = rebaseNextResult(replaceTerm, i, offset, results)

    if (rebaseNextResultResponse) {
      offset = rebaseNextResultResponse[0]
      results = rebaseNextResultResponse[1]
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
    showSearchTerms: false,
    decorations: [],
    results: [],
  },

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
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
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
