import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEntry, mdToBlocks } from "./build_glossary.mjs";

test("parseEntry reads frontmatter and compiles the body", () => {
  const raw = [
    "---",
    "title: Gradient Descent",
    "slug: gradient-descent",
    "kind: technique",
    "category: Optimization",
    "aliases: GD, steepest descent",
    "related: learning-rate, momentum",
    "summary: An optimization algorithm that walks downhill on the loss.",
    "---",
    "",
    "First paragraph mentions the learning rate.",
    "",
    "Second paragraph.",
  ].join("\n");
  const e = parseEntry(raw);
  assert.equal(e.slug, "gradient-descent");
  assert.equal(e.title, "Gradient Descent");
  assert.equal(e.kind, "technique");
  assert.deepEqual(e.aliases, ["GD", "steepest descent"]);
  assert.deepEqual(e.related, ["learning-rate", "momentum"]);
  assert.equal(e.body.length, 2);
  assert.equal(e.body[0].type, "p");
  assert.match(e.body[0].text, /learning rate/);
});

test("parseEntry rejects a file with no frontmatter or no required fields", () => {
  assert.equal(parseEntry("just text, no fence"), null);
  assert.equal(parseEntry("---\ntitle: X\n---\nbody"), null); // no slug
});

test("mdToBlocks handles paragraphs, headings, lists, quotes, and code", () => {
  const blocks = mdToBlocks(
    ["Para one.", "", "## A Subheading", "", "- item a", "- item b", "", "> a quote", "", "```", "code line", "```"].join("\n")
  );
  const types = blocks.map((b) => b.type);
  assert.deepEqual(types, ["p", "h", "ul", "quote", "code"]);
  assert.deepEqual(blocks[2].items, ["item a", "item b"]);
  assert.equal(blocks[4].text, "code line");
});
