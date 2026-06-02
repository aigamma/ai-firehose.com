import { test } from "node:test";
import assert from "node:assert/strict";
import { vttToText } from "./transcript.mjs";

test("vttToText drops cue scaffolding and collapses auto-caption repetition", () => {
  const vtt = [
    "WEBVTT",
    "Kind: captions",
    "Language: en",
    "",
    "1",
    "00:00:01.000 --> 00:00:03.000",
    "hello world",
    "",
    "2",
    "00:00:03.000 --> 00:00:05.000",
    "hello world",
    "",
    "3",
    "00:00:05.000 --> 00:00:07.000",
    "<c>this</c> is a test",
  ].join("\n");
  assert.equal(vttToText(vtt), "hello world this is a test");
});
