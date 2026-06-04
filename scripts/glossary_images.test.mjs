import { test } from "node:test";
import assert from "node:assert/strict";
import {
  licenseOk,
  licenseUrl,
  cleanArtist,
  cleanCredit,
  commonsFileFromUploadUrl,
  extFor,
  sniffImage,
} from "./glossary_images.mjs";

test("licenseOk accepts redistributable licenses, rejects NC/ND/non-free", () => {
  assert.ok(licenseOk("CC BY-SA 4.0"));
  assert.ok(licenseOk("CC BY 4.0"));
  assert.ok(licenseOk("CC0"));
  assert.ok(licenseOk("Public domain"));
  assert.ok(licenseOk("PD-US"));
  assert.ok(licenseOk("BSD-3-Clause"));
  assert.ok(licenseOk("MIT License"));
  assert.ok(licenseOk("Apache-2.0"));
  assert.ok(!licenseOk("limit")); // must not match the 'mit' substring
  assert.ok(!licenseOk("CC BY-NC 4.0"));
  assert.ok(!licenseOk("CC BY-ND 4.0"));
  assert.ok(!licenseOk("CC BY-NC-SA 3.0"));
  assert.ok(!licenseOk("Fair use"));
  assert.ok(!licenseOk("All rights reserved"));
  assert.ok(!licenseOk(""));
});

test("licenseUrl maps to canonical deeds", () => {
  assert.equal(licenseUrl("CC BY-SA 4.0"), "https://creativecommons.org/licenses/by-sa/4.0/");
  assert.equal(licenseUrl("CC BY 3.0"), "https://creativecommons.org/licenses/by/3.0/");
  assert.equal(licenseUrl("CC0"), "https://creativecommons.org/publicdomain/zero/1.0/");
  assert.ok(licenseUrl("Public domain").includes("Public_domain"));
});

test("cleanArtist strips HTML and entities", () => {
  assert.equal(cleanArtist('<a href="/wiki/User:Foo">Foo Bar</a>'), "Foo Bar");
  assert.equal(cleanArtist("Jane &amp; John"), "Jane & John");
  assert.equal(cleanArtist(""), "");
});

test("cleanCredit replaces an em dash so external names never trip the writing-rule gate", () => {
  const emDash = String.fromCharCode(0x2014);
  assert.equal(cleanCredit(`Jane Doe ${emDash} photographer`), "Jane Doe photographer");
  assert.equal(cleanCredit("  Foo   Bar  "), "Foo Bar");
  assert.ok(!cleanCredit(`a${emDash}b`).includes(emDash));
});

test("commonsFileFromUploadUrl extracts the File title from thumb and original URLs", () => {
  assert.equal(
    commonsFileFromUploadUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Colored_neural_network.svg/330px-Colored_neural_network.svg.png"),
    "Colored_neural_network.svg",
  );
  assert.equal(
    commonsFileFromUploadUrl("https://upload.wikimedia.org/wikipedia/commons/a/ad/Convolutional_Neural_Network.gif"),
    "Convolutional_Neural_Network.gif",
  );
  assert.equal(commonsFileFromUploadUrl("https://example.com/foo.png"), null);
});

test("extFor prefers content-type then URL then png", () => {
  assert.equal(extFor("image/png", "x"), "png");
  assert.equal(extFor("image/jpeg", "x"), "jpg");
  assert.equal(extFor("image/svg+xml", "x"), "svg");
  assert.equal(extFor("", "https://h/foo.gif"), "gif");
  assert.equal(extFor("", "https://h/foo.jpeg?w=1"), "jpg");
  assert.equal(extFor("", "https://h/noext"), "png");
});

test("sniffImage detects real magic bytes and rejects HTML", () => {
  assert.equal(sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0, 0, 0, 0, 0, 0, 0, 0])), "png");
  assert.equal(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), "jpg");
  assert.equal(sniffImage(Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), "gif");
  assert.equal(sniffImage(Buffer.from("<!DOCTYPE html><html><body>404</body></html>".padEnd(64, " "))), null);
  assert.equal(sniffImage(Buffer.from('<?xml version="1.0"?><svg xmlns="...">'.padEnd(64, " "))), "svg");
  assert.equal(sniffImage(Buffer.from([1, 2, 3])), null);
});
