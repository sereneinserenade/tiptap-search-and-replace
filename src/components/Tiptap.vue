<template>
  <div class="menubar">
    <button @click="bold">
      Bold
    </button>
    <button @click="italic">
      Italic
    </button>

    <input type="text" placeholder="Search..." v-model="searchTerm" />

    <input type="text" placeholder="Replace..." v-model="replaceTerm" />

    <button @click="find">
      Find
    </button>

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
</template>

<script lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { ref } from "vue";
import { Search } from './search'

export default {
  components: {
    EditorContent
  },

  setup() {
    const editor = useEditor({
      content:
        "<p> Test for search and replace. search for 'amazing' and replace it with 'awe-inspiring'.</p>",
      extensions: [StarterKit, Search]
    });

    const bold = () =>
      editor.value
        ?.chain()
        .toggleBold()
        .focus()
        .run();

    const italic = () =>
      editor.value
        ?.chain()
        .toggleItalic()
        .focus()
        .run();

    const searchTerm = ref<string>("");

    const replaceTerm = ref<string>("");

    const find = () => {
      if (editor.value) editor.value.storage.search.searchTerm = searchTerm.value
    }
    

    const replace = () => [];

    const clear = () => [];

    const replaceAll = () => [];

    return { editor, bold, italic, searchTerm, replaceTerm, find, replace, clear, replaceAll };
  }
};
</script>

<style lang="scss">
.menubar {
  display: flex;
  gap: 1em;
}

.ProseMirror {
  outline: none !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Open Sans", "Helvetica Neue", sans-serif;
}
</style>
