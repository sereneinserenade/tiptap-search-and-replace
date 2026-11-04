const test = require("node:test");
const assert = require("node:assert/strict");
const { createEditor, searchFor, currentDecorationRanges } = require("./helpers/editor.cjs");

test("resultIndex wraps to 0 when it falls past the end after a replace", () => {
  const editor = createEditor("a a a");
  searchFor(editor, "a", "b");
  editor.commands.previousSearchResult();
  const storage = editor.storage.searchAndReplace;
  assert.equal(storage.resultIndex, 2);

  editor.commands.replace();

  assert.equal(storage.results.length, 2);
  assert.equal(storage.resultIndex, 0);
  assert.equal(storage.lastResultIndex, 0);
  assert.deepEqual(currentDecorationRanges(editor), [storage.results[0]]);
  editor.destroy();
});

test("resultIndex wraps to 0 when an edit deletes the last match", () => {
  const editor = createEditor("a a a");
  searchFor(editor, "a", "b");
  editor.commands.previousSearchResult();
  const storage = editor.storage.searchAndReplace;
  const lastMatch = storage.results[2];

  editor.commands.deleteRange(lastMatch);

  assert.equal(storage.results.length, 2);
  assert.equal(storage.resultIndex, 0);
  assert.deepEqual(currentDecorationRanges(editor), [storage.results[0]]);
  editor.destroy();
});

test("replacing the only matches leaves resultIndex 0 after each replace", () => {
  const editor = createEditor("a a");
  searchFor(editor, "a", "b");
  editor.commands.previousSearchResult();
  const storage = editor.storage.searchAndReplace;

  editor.commands.replace();
  assert.equal(storage.results.length, 1);
  assert.equal(storage.resultIndex, 0);

  editor.commands.replace();
  assert.deepEqual(storage.results, []);
  assert.equal(storage.resultIndex, 0);
  editor.destroy();
});

test("previous with no matches keeps resultIndex at 0, and the first added match becomes current", () => {
  const editor = createEditor("x");
  searchFor(editor, "a", "b");
  editor.commands.previousSearchResult();
  const storage = editor.storage.searchAndReplace;
  assert.equal(storage.resultIndex, 0);

  editor.commands.insertContentAt(1, { type: "text", text: "a" });

  assert.equal(storage.results.length, 1);
  assert.equal(storage.resultIndex, 0);
  assert.deepEqual(currentDecorationRanges(editor), [storage.results[0]]);
  editor.destroy();
});

test("resultIndex inside the results is kept after a replace", () => {
  const editor = createEditor("a a a");
  searchFor(editor, "a", "b");
  editor.commands.nextSearchResult();
  const storage = editor.storage.searchAndReplace;

  editor.commands.replace();

  assert.equal(storage.results.length, 2);
  assert.equal(storage.resultIndex, 1);
  editor.destroy();
});
