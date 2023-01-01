<template>
  <div class="tiptap">
    <section class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold"> Tiptap 2 Search-N-Replace </h2>

      <section>
        <a class="flex gap-1" target="_blank" href="https://github.com/sereneinserenade/tiptap-search-n-replace-demo">
          <img class="github-link" :src="GithubIcon" alt="Github Link" />

          <h3>Repository</h3>
        </a>
      </section>
    </section>

    <div class="flex flex-col gap-6">
      <section class="flex gap-6">
        <div>
          <label for="search-term" class="block text-sm font-medium text-gray-700">Search</label>
          <div class="mt-1">
            <input v-model="searchTerm" @keydown.enter.prevent="updateSearchReplace" type="text" placeholder="Search..."
              autofocus="true"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
        </div>

        <div>
          <label for="search-term" class="block text-sm font-medium text-gray-700">Replace</label>
          <div class="mt-1">
            <input v-model="replaceTerm" @keydown.enter.prevent="replace" type="text" placeholder="Replace..."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
        </div>
      </section>

      <span class="isolate inline-flex rounded-md">
        <button @click="clear" type="button"
          class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          Clear
        </button>
        <button @click="replace" type="button"
          class="relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          Replace
        </button>
        <button @click="replaceAll" type="button"
          class="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          Replace All
        </button>
      </span>
    </div>
    <editor-content class="prose" :editor="editor" />
  </div>
</template>

<script lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { onMounted, ref, watch } from "vue";

import { SearchAndReplace } from "../tiptap-extensions/searchAndReplace";
import GithubIcon from '../assets/github.svg'

export default {
  components: {
    EditorContent
  },

  setup() {
    const editor = useEditor({
      content:
        "<h3><strong>What’s Tiptap?</strong></h3><p></p><p>tiptap is a headless wrapper around ProseMirror – a toolkit for building rich text WYSIWYG editors, which is already in use at many well-known companies such as <em>New York Times</em>, <em>The Guardian</em> or <em>Atlassian</em>.</p><p>Create exactly the rich text editor you want out of customizable building blocks. Tiptap comes with sensible defaults, a lot of extensions and a friendly API to customize every aspect. It’s backed by a welcoming community, open source, and free.</p><p></p><h2>This is tiptap search and replace extension.</h2><h3>A ⭐️ to the repo if you 👍 / ❤️ what I'm doing would be much appreciated.</h3>",
      extensions: [
        StarterKit,
        SearchAndReplace.configure()
      ],
      onUpdate: ({ editor }) => {
        console.log(editor.getHTML())
      }
    });

    const searchTerm = ref<string>("tiptap");

    const replaceTerm = ref<string>("ProseMirror");

    const updateSearchReplace = () => {
      if (!editor.value) return;
      editor.value.commands.setSearchTerm(searchTerm.value);
      editor.value.commands.setReplaceTerm(replaceTerm.value);
    };

    watch(
      () => searchTerm.value.trim(),
      (val, oldVal) => {
        if (!val) clear();
        if (val !== oldVal) updateSearchReplace()
      }
    );

    watch(
      () => replaceTerm.value.trim(),
      (val, oldVal) => (val === oldVal ? null : updateSearchReplace())
    );

    const replace = () => editor.value?.commands.replace();

    const clear = () => (searchTerm.value = replaceTerm.value = "");

    const replaceAll = () => editor.value?.commands.replaceAll();

    onMounted(() => setTimeout(updateSearchReplace))

    return {
      editor,
      searchTerm,
      replaceTerm,
      updateSearchReplace,
      replace,
      clear,
      replaceAll,
      GithubIcon
    };
  }
};
</script>

<style lang="scss">
.tiptap {
  display: flex;
  flex-direction: column;
  margin: 1em 0;

  .ProseMirror {
    outline: none !important;
    padding: 1em 2px;

    .search-result {
      background-color: rgba(255, 217, 0, 0.5);
    }
  }
}
</style>
