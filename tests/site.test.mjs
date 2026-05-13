import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

let html = "";
try {
  html = await readFile(new URL("../index.html", import.meta.url), "utf8");
} catch (error) {
  if (error?.code === "ENOENT") {
    assert.fail("index.html should exist for the Pixal3D MVP");
  }

  throw error;
}

assert.match(
  html,
  /<iframe[^>]+src="https:\/\/tencentarc-pixal3d\.hf\.space[^"]*"/i,
  "index.html should embed the TencentARC/Pixal3D Space runtime in an iframe",
);

assert.match(
  html,
  /<iframe[^>]+title="[^"]*Pixal3D[^"]*"/i,
  "iframe should include an accessible title that mentions Pixal3D",
);

assert.doesNotMatch(
  html,
  /<p\s+class="eyebrow">\s*MVP\s*<\/p>/i,
  "page should not show the MVP badge in the header",
);

assert.doesNotMatch(
  html,
  />\s*Open Space\s*</i,
  "page should not show the Open Space button",
);

assert.match(
  html,
  /AI[^<]*3D|3D[^<]*AI/i,
  "page should present the MVP as an AI 3D model generation experience",
);
