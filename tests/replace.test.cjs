const test = require("node:test");
const assert = require("node:assert/strict");
const { createEditor, searchFor } = require("./helpers/editor.cjs");

const originalText = "a1 a2 a3";

const setup = (searchTerm) => {
  const editor = createEditor(originalText);
  searchFor(editor, searchTerm, "X");
  return editor;
};

test("replace without navigating replaces the first match", () => {
  const editor = setup("a");
  editor.commands.replace();
  assert.equal(editor.getText(), "X1 a2 a3");
});

test("replace after next replaces the second match", () => {
  const editor = setup("a");
  editor.commands.nextSearchResult();
  editor.commands.replace();
  assert.equal(editor.getText(), "a1 X2 a3");
});

test("replace after previous replaces the last match", () => {
  const editor = setup("a");
  editor.commands.previousSearchResult();
  editor.commands.replace();
  assert.equal(editor.getText(), "a1 a2 X3");
});

test("replace after the last match is replaced hits the first match", () => {
  const editor = setup("a");
  editor.commands.previousSearchResult();
  editor.commands.replace();
  editor.commands.replace();
  assert.equal(editor.getText(), "X1 a2 X3");
});

test("replace with no results leaves the document unchanged", () => {
  const editor = setup("z");
  assert.doesNotThrow(() => editor.commands.replace());
  assert.equal(editor.getText(), originalText);
});

test("can().replace() does not change the document", () => {
  const editor = setup("a");
  editor.commands.nextSearchResult();
  assert.doesNotThrow(() => editor.can().replace());
  assert.equal(editor.getText(), originalText);
});

test("replaceAll replaces every match", () => {
  const editor = setup("a");
  editor.commands.nextSearchResult();
  editor.commands.replaceAll();
  assert.equal(editor.getText(), "X1 X2 X3");
});
