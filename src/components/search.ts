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
        updateView(state, dispatch)
        return false
      },
      setReplaceTerm: (replaceTerm: string) => ({ state, dispatch }) => {
        this.options.replaceTerm = replaceTerm
        updateView(state, dispatch)
        return false
      }
    }
  },

  onUpdate() {
    this.options.searchTerm = 'amazing'
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
