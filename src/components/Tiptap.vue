<template>
  <div class="tiptap">
    <section class="flex justify-between items-center">
      <h2> Tiptap 2 Search-N-Replace </h2>

      <section>
        <a class="flex gap-1" target="_blank" href="https://github.com/sereneinserenade/tiptap-search-n-replace-demo">
          <img class="github-link" :src="GithubIcon" alt="Github Link" />

          <h3>Repository</h3>
        </a>
      </section>

    </section>

    <hr>
    <div class="menubar">
      <input @keydown.enter.prevent="updateSearchReplace" type="text" placeholder="Search..." v-model="searchTerm" autofocus="true" />

      <input @keypress.enter.prevent="replace" type="text" placeholder="Replace..." v-model="replaceTerm" />

      <button @click="clear">
        Clear
      </button>
      <button @click="replace">
        Replace
      </button>
      <button @click="replaceAll">
        Replace All
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { onMounted, ref, watch } from "vue";

import { SearchNReplace } from "./search";
import GithubIcon from '../assets/github.svg'

export default {
  components: {
    EditorContent
  },

  setup() {
    const editor = useEditor({
      content:
        "<h2>Test for search and replace. Search for 'amazing' and replace it with 'awe-inspiring' or 'astonishing'.</h2><p></p><h3>A ⭐️ to the repo if you 👍 / ❤️ what I'm doing would be much appreciated.</h3>",
      extensions: [StarterKit, SearchNReplace],
      onUpdate: ({ editor }) => {
        console.log(editor.getHTML())
      }
    });

    const searchTerm = ref<string>("replace");

    const replaceTerm = ref<string>("astonishing");

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

  hr {
    color: white;
    width: 100%;
    margin-bottom: 2rem;
  }

  .menubar {
    display: flex;
    gap: 1em;
    background-color: rgba(white, 0.25);
    padding: 0.5em;
    border-radius: 6px;
    width: fit-content;

    input {
      height: 2em;
      border-radius: 6px;
      border: none;
      outline: none;
      padding: 4px 8px;
    }

    button {
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }
  }


  .ProseMirror {
    outline: none !important;
    padding: 1em 2px;

    .search-result {
      background-color: rgba(255, 217, 0, 0.5);
    }
  }
}
</style>
