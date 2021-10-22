<template>
  <div class="tiptap">
    <div class="menubar">
      <input
        @keydown.enter.prevent="updateSearchReplace"
        type="text"
        placeholder="Search..."
        v-model="searchTerm"
      />

      <input
        @keypress.enter.prevent="replace"
        type="text"
        placeholder="Replace..."
        v-model="replaceTerm"
      />

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
import { ref, watch } from "vue";
import { SearchNReplace } from "./search";

export default {
  components: {
    EditorContent
  },

  setup() {
    const editor = useEditor({
      content:
        "<p> Test for search and replace. search for 'amazing' and replace it with 'awe-inspiring'.</p>",
      extensions: [StarterKit, SearchNReplace]
    });

    const searchTerm = ref<string>("");

    const replaceTerm = ref<string>("");

    const updateSearchReplace = () => {
      if (!editor.value) return;
      editor.value.commands.setSearchTerm(searchTerm.value);
      editor.value.commands.setReplaceTerm(replaceTerm.value);
    };

    watch(
      () => searchTerm.value.trim(),
      (val, oldVal) => {
        if (!val) clear();
        val === oldVal ? null : updateSearchReplace();
      }
    );

    watch(
      () => replaceTerm.value.trim(),
      (val, oldVal) => (val === oldVal ? null : updateSearchReplace())
    );

    const replace = () => editor.value?.commands.replace();

    const clear = () => (searchTerm.value = replaceTerm.value = "");

    const replaceAll = () => editor.value?.commands.replaceAll();

    return {
      editor,
      searchTerm,
      replaceTerm,
      updateSearchReplace,
      replace,
      clear,
      replaceAll
    };
  }
};
</script>

<style lang="scss">
.tiptap {
  display: flex;
  flex-direction: column;

  .menubar {
    display: flex;
    gap: 1em;
    background: rgba(128, 128, 128, 0.25);
    padding: 0.5em;
    border-radius: 6px;
    justify-content: center;

    input {
      height: 2em;
      border-radius: 6px;
      border: none;
      outline: none;
      padding: 0.4em;
    }

    button {
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background: white;
    }

  }

  .search-result {
    background: rgb(255, 217, 0);
  }

  .ProseMirror {
    outline: none !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
      "Open Sans", "Helvetica Neue", sans-serif;
  }
}
</style>
