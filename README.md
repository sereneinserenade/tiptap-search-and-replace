# Tiptap 2 Search and Replace

Search and Replace extension for [Tiptap 2](https://tiptap.dev). Published to npm as [@sereneinserenade/tiptap-search-and-replace](https://www.npmjs.com/package/@sereneinserenade/tiptap-search-and-replace).

A ⭐️ to the repo if you 👍 / ❤️  what I'm doing would be much appreciated. If you're using this extension and making money from it, it'd be very kind of you to [:heart: Sponsor me](https://github.com/sponsors/sereneinserenade). If you're looking for a **dev to work you on your project's Rich Text Editor** with or as **a frontend developer, [DM me on Discord/Twitter/LinkedIn](https://github.com/sereneinserenade)👨‍💻🤩**.

I've made a bunch of extensions for Tiptap 2, some of them are **Google Docs like Commenting**, **Resize image and Videos**, **LanguageTool integration** with tiptap. You can check it our here https://github.com/sereneinserenade#a-glance-of-my-projects .

# Live Demo

Try it out live at https://sereneinserenade.github.io/tiptap-search-and-replace, and/or take a look at a demo-video below.

<details> 
  <summary> <b>demo-video</b> </summary>
  
https://user-images.githubusercontent.com/45892659/163356581-5fd38888-4e29-41d9-b64f-d17948ef7a16.mov
</details>

## How to use

> **Note**: npm version is not up-to-date. Just copy paste [the extension](./src/tiptap-extensions/searchAndReplace.ts) in your code and it should work

**Ideally you should keep track of these states in your code, but if you absolutely need to read the `searchTerm` and `replaceTerm` from extension, here's the code.**
```ts
const searchTerm: string = editor.storage.searchAndReplace.searchTerm
const replaceTerm: string = editor.storage.searchAndReplace.replaceTerm
```


I've published it as an [npm package](https://www.npmjs.com/package/@sereneinserenade/tiptap-search-and-replace) so you can either directly install it, 
 
<details>
  <summary> with NPM </summary>

```
npm i @sereneinserenade/tiptap-search-and-replace
```
</details>
<details>
  <summary> with Yarn </summary>

```
yarn add @sereneinserenade/tiptap-search-and-replace
```
</details>

### Here are example implementations in Vue and React

<details>
  <summary> Vue </summary>

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

const searchTerm = ref<string>("replace");

const replaceTerm = ref<string>("astonishing");

// you can use the commands provided by SearchNReplace extension to update the values of search and replace terms.
const updateSearchReplace = () => {
  if (!editor.value) return;
  editor.value.commands.setSearchTerm(searchTerm.value);
  editor.value.commands.setReplaceTerm(replaceTerm.value);
};
```
</details>
  
<details>
  <summary> React </summary>

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

const searchTerm = useState<string>("replace");

const replaceTerm = useState<string>("astonishing");

// you can use the commands provided by SearchNReplace extension to update the values of search and replace terms.
const updateSearchReplace = () => { // you can probably use `useCallback` hook)
  if (!editor.value) return;
  editor.value.commands.setSearchTerm(searchTerm.value);
  editor.value.commands.setReplaceTerm(replaceTerm.value);
};
```
</details>



## Contributing

Show your ❤️ by ⭐️ing this repository! It means a lot.

Clone the repo, do something, make a PR(or not). You know what's the drill. Looking forward to your PRs, you amazing devs.

## Awesome peeps, who've starred this repo 🚀! Thank you!
[![Stargazers repo roster for @sereneinserenade/tiptap-search-and-replace](https://reporoster.com/stars/dark/sereneinserenade/tiptap-search-and-replace)](https://github.com/sereneinserenade/tiptap-search-and-replace/stargazers)

---

<details>
  <summary> Stuff that nobody really cares about </summary>

  # Vue 3 + Vite

  This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

  ## Recommended IDE Setup

  - [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
</details>
