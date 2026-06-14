import { test } from "node:test";
import assert from "node:assert/strict";
import { vttToText, vttToSegments, compactTranscript } from "./transcript.mjs";

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

test("vttToSegments keeps cue start times, strips word tags, and drops rolling repeats", () => {
  const vtt = [
    "WEBVTT",
    "Kind: captions",
    "Language: en",
    "",
    "00:00:01.000 --> 00:00:03.000 align:start position:0%",
    "hello world",
    "",
    "00:00:03.000 --> 00:00:05.000",
    "hello world",
    "",
    "00:01:05.000 --> 00:01:07.000",
    "<00:01:05.500><c>this</c> is a test",
  ].join("\n");
  assert.deepEqual(vttToSegments(vtt), [
    { t: 1, text: "hello world" },
    { t: 65, text: "this is a test" },
  ]);
});

test("compactTranscript buckets segments under [mm:ss] markers", () => {
  const segs = [
    { t: 0, text: "a" },
    { t: 10, text: "b" },
    { t: 35, text: "c" },
  ];
  assert.equal(compactTranscript(segs, { bucketSeconds: 30 }), "[0:00] a b\n[0:35] c");
  assert.equal(compactTranscript([], { bucketSeconds: 30 }), "");
});
