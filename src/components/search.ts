import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { Node as ProsemirrorNode } from 'prosemirror-model'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    search: {
      /**
       * Find text in editor
       */
      setSearchTerm: (searchTerm: string) => void,
      setReplaceTerm: (replaceTerm: string) => void,
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

// eslint-disable-next-line @typescript-eslint/ban-types
export const Search = Extension.create<{}, SearchStorage>({
  name: 'search',

  addStorage() {
    return {
      searchTerm: '',
      replaceTerm: '',
      showSearchTerms: false,
      decorations: [],
    }
  },

  addCommands() {
    return {
      setSearchTerm: (searchTerm: string) => () => {
        debugger
        this.storage.searchTerm = searchTerm
        console.log(this.storage)
      },
      setReplaceTerm: (replaceTerm: string) => () => {
        this.storage.replaceTerm = replaceTerm
      }
    }
  },

  addProseMirrorPlugins() {
    const { searchTerm, replaceTerm, showSearchTerms } = this.storage;

    return [
      new Plugin({
        key: new PluginKey('search'),
        state: {
          init(_, { doc }) {
            return processSearches(doc, searchTerm)
          },
          apply(transaction, oldState) {
            return transaction.docChanged
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
