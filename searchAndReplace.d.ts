import { Extension, Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        search: {
            /**
             * @description Set search term in extension.
             */
            setSearchTerm: (searchTerm: string) => ReturnType;
            /**
             * @description Set replace term in extension.
             */
            setReplaceTerm: (replaceTerm: string) => ReturnType;
            /**
             * @description Replace first instance of search result with given replace term.
             */
            replace: () => ReturnType;
            /**
             * @description Replace all instances of search result with given replace term.
             */
            replaceAll: () => ReturnType;
        };
    }
}
export declare const searchAndReplacePluginKey: PluginKey<any>;
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
export declare const SearchAndReplace: Extension<SearchAndReplaceOptions, SearchAndReplaceStorage>;
export default SearchAndReplace;
