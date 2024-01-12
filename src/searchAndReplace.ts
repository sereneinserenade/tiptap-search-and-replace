// MIT License

// Copyright (c) 2023 Jeet Mandaliya (Github Username: sereneinserenade)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Extension, Range } from "@tiptap/core"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Node as PMNode } from "@tiptap/pm/model"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    search: {
      /**
       * @description Set search term in extension.
       */
      setSearchTerm: (searchTerm: string) => ReturnType,
      /**
       * @description Set replace term in extension.
       */
      setReplaceTerm: (replaceTerm: string) => ReturnType,
      /**
       * @description Replace first instance of search result with given replace term.
       */
      replace: () => ReturnType,
      /**
       * @description Replace all instances of search result with given replace term.
       */
      replaceAll: () => ReturnType,
    }
  }
}

interface TextNodesWithPosition {
  text: string;
  pos: number;
}

const getRegex = (s: string, disableRegex: boolean, caseSensitive: boolean): RegExp => {
  return RegExp(disableRegex ? s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : s, caseSensitive ? "gu" : "gui");
}

interface ProcessedSearches {
  decorationsToReturn: DecorationSet,
  results: Range[]
}

function processSearches (doc: PMNode, searchTerm: RegExp, searchResultClass: string): ProcessedSearches {
  const decorations: Decoration[] = []
  let textNodesWithPosition: TextNodesWithPosition[] = []
  const results: Range[] = []

  let index = 0

  if (!searchTerm) return { decorationsToReturn: DecorationSet.empty, results: [] }

  doc?.descendants((node, pos) => {
    if (node.isText) {
      if (textNodesWithPosition[index]) {
        textNodesWithPosition[index] = {
          text: textNodesWithPosition[index].text + node.text,
          pos: textNodesWithPosition[index].pos,
        }
      } else {
        textNodesWithPosition[index] = {
          text: `${node.text}`,
          pos,
        }
      }
    } else {
      index += 1
    }
  })

  textNodesWithPosition = textNodesWithPosition.filter(Boolean)

  for (let i = 0; i < textNodesWithPosition.length; i += 1) {
    const { text, pos } = textNodesWithPosition[i]

    const matches = Array.from(text.matchAll(searchTerm)).filter(([ matchText ]) => matchText.trim())

    for (let j = 0; j < matches.length; j += 1) {
      const m = matches[j]

      if (m[0] === "") break

      if (m.index !== undefined) {
        results.push({
          from: pos + m.index,
          to: pos + m.index + m[0].length,
        })
      }
    }
  }

  for (let i = 0; i < results.length; i += 1) {
    const r = results[i]
    decorations.push(Decoration.inline(r.from, r.to, { class: searchResultClass }))
  }

  return {
    decorationsToReturn: DecorationSet.create(doc, decorations),
    results,
  }
}

const replace = (replaceTerm: string, results: Range[], { state, dispatch }: any) => {
  const firstResult = results[0]

  if (!firstResult) return

  const { from, to } = results[0]

  if (dispatch) dispatch(state.tr.insertText(replaceTerm, from, to))
}

const rebaseNextResult = (replaceTerm: string, index: number, lastOffset: number, results: Range[]): [number, Range[]] | null => {
  const nextIndex = index + 1

  if (!results[nextIndex]) return null

  const { from: currentFrom, to: currentTo } = results[index]

  const offset = (currentTo - currentFrom - replaceTerm.length) + lastOffset

  const { from, to } = results[nextIndex]

  results[nextIndex] = {
    to: to - offset,
    from: from - offset,
  }

  return [ offset, results ]
}

const replaceAll = (replaceTerm: string, results: Range[], { tr, dispatch }: any) => {
  let offset = 0

  let resultsCopy = results.slice()

  if (!resultsCopy.length) return

  for (let i = 0; i < resultsCopy.length; i += 1) {
    const { from, to } = resultsCopy[i]

    tr.insertText(replaceTerm, from, to)

    const rebaseNextResultResponse = rebaseNextResult(replaceTerm, i, offset, resultsCopy)

    if (!rebaseNextResultResponse) continue

    offset = rebaseNextResultResponse[0]
    resultsCopy = rebaseNextResultResponse[1]
  }

  dispatch(tr)
}

export const searchAndReplacePluginKey = new PluginKey("searchAndReplacePlugin")

export interface SearchAndReplaceOptions {
  searchResultClass: string;
  caseSensitive: boolean;
  disableRegex: boolean;
}

export interface SearchAndReplaceStorage {
  searchTerm: string;
  replaceTerm: string;
  results: Range[];
  lastSearchTerm: string;
}

export const SearchAndReplace = Extension.create<SearchAndReplaceOptions, SearchAndReplaceStorage>({
  name: "searchAndReplace",

  addOptions () {
    return {
      searchResultClass: "search-result",
      caseSensitive: false,
      disableRegex: true,
    }
  },

  addStorage () {
    return {
      searchTerm: "",
      replaceTerm: "",
      results: [],
      lastSearchTerm: "",
    }
  },

  addCommands () {
    return {
      setSearchTerm: (searchTerm: string) => ({ editor }) => {
        editor.storage.searchAndReplace.searchTerm = searchTerm

        return false
      },
      setReplaceTerm: (replaceTerm: string) => ({ editor }) => {
        editor.storage.searchAndReplace.replaceTerm = replaceTerm

        return false
      },
      replace: () => ({ editor, state, dispatch }) => {
        const { replaceTerm, results } = editor.storage.searchAndReplace

        replace(replaceTerm, results, { state, dispatch })

        return false
      },
      replaceAll: () => ({ editor, tr, dispatch }) => {
        const { replaceTerm, results } = editor.storage.searchAndReplace

        replaceAll(replaceTerm, results, { tr, dispatch })

        return false
      },
    }
  },

  addProseMirrorPlugins () {
    const editor = this.editor
    const { searchResultClass, disableRegex, caseSensitive } = this.options

    const setLastSearchTerm = (t) => editor.storage.searchAndReplace.lastSearchTerm = t

    return [
      new Plugin({
        key: searchAndReplacePluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply ({ doc, docChanged }, oldState) {
            const { searchTerm, lastSearchTerm } = editor.storage.searchAndReplace

            if (!docChanged && lastSearchTerm === searchTerm) return oldState

            setLastSearchTerm(searchTerm)

            if (!searchTerm) return DecorationSet.empty

            const {
              decorationsToReturn,
              results,
            } = processSearches(doc, getRegex(searchTerm, disableRegex, caseSensitive), searchResultClass)

            editor.storage.searchAndReplace.results = results

            return decorationsToReturn
          },
        },
        props: {
          decorations (state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

export default SearchAndReplace
