import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { EditorState, Plugin, PluginKey, TextSelection } from 'prosemirror-state'
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

function processSearches(doc: ProsemirrorNode, searchTerm: string) {
  const regex = new RegExp(searchTerm)
  const decorations: any[] = []
  const results: any[] = [];

  doc?.descendants((node, position) => {
    if (!node.isText) return;

    if (!node.text) return;

    const matches = regex.exec(node.text);

    if (matches) {
      results.push({
        from: position + matches.index,
        to: position + matches.index + matches[0].length
      });
    }
  });

  results.forEach(issue => {
    decorations.push(Decoration.inline(issue.from, issue.to, { class: "search-result" }));
  });

  return DecorationSet.create(doc, decorations)
}

export interface SearchStorage {
  searchTerm: string,
  replaceTerm: string,
  showSearchTerms: boolean,
  decorations: any[],
}

const updateView = (state: EditorState<any>, dispatch: any) => {
  dispatch(state.tr)
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const Search = Extension.create({
  name: 'search',

  defaultOptions: {
    searchTerm: 'rep',
    replaceTerm: '',
    showSearchTerms: false,
    decorations: [],
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
    // const { searchTerm, replaceTerm, showSearchTerms } = this.storage;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const oldThis = this;

    return [
      new Plugin({
        key: new PluginKey('search'),
        state: {
          init(_, { doc }) {
            const searchTerm = oldThis.options.searchTerm
            return processSearches(doc, searchTerm)
          },
          apply(transaction, oldState) {
            const searchTerm = oldThis.options.searchTerm
            return transaction.docChanged || searchTerm
              // ? runAllLinterPlugins(transaction.doc, plugins)
              ? processSearches(transaction.doc, searchTerm)
              : oldState
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
