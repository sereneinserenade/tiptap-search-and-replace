const { Editor, Node } = require("@tiptap/core");
const { SearchAndReplace, searchAndReplacePluginKey } = require("../../src/searchAndReplace.ts");

const Document = Node.create({ name: "doc", topNode: true, content: "block+" });
const Paragraph = Node.create({
  name: "paragraph",
  group: "block",
  content: "text*",
});
const Text = Node.create({ name: "text", group: "inline" });

const createEditor = (text) => {
  const editor = new Editor({
    element: null,
    extensions: [Document, Paragraph, Text, SearchAndReplace],
    content: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    },
  });
  // Tiptap installs extension plugins only when a view mounts, and there is no DOM here.
  for (const plugin of editor.extensionManager.plugins) editor.registerPlugin(plugin);
  return editor;
};

const searchFor = (editor, searchTerm, replaceTerm) => {
  editor.commands.setSearchTerm(searchTerm);
  editor.commands.setReplaceTerm(replaceTerm);
};

const currentDecorationRanges = (editor) =>
  searchAndReplacePluginKey
    .getState(editor.state)
    .find()
    .filter((decoration) => decoration.type.attrs.class.includes("search-result-current"))
    .map(({ from, to }) => ({ from, to }));

module.exports = { createEditor, searchFor, currentDecorationRanges };
