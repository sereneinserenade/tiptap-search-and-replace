import { Editor } from '@tiptap/vue-3';

export const bold = (editor: Editor | any) =>
  editor
    ?.chain()
    .toggleBold()
    .focus()
    .run();

export const italic = (editor: Editor | any) =>
  editor
    ?.chain()
    .toggleItalic()
    .focus()
    .run();