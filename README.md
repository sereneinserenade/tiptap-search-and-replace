# tiptap-search-n-replace



https://user-images.githubusercontent.com/45892659/138535328-b80552a7-792a-4392-b247-302f0405c8fa.mov


## How to use

copy `search.ts` file in your own repo and import `SearchNReplace` from that file and use that as an extension. For more details see [./src/components/Tiptap.vue](https://github.com/sereneinserenade/tiptap-search-n-replace-demo/blob/main/src/components/Tiptap.vue) .

```ts
import { Editor } from "@tiptap/core";
import { SearchNReplace } from "./path/to/search-n-replace.ts/";

const editor = new Editor({
  content: "<p>Example Text</p>",
  extensions: [
    SearchNReplace.configure({
      searchResultClass: "search-result", // class to give to found items. default 'search-result'
      caseSensitive: false, // no need to explain
      disableRegex: false, // also no need to explain
    }),
  ],
});
```
