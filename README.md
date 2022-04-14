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

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
