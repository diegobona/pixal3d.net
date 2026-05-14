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

let favicon = "";
try {
  favicon = await readFile(new URL("../favicon.svg", import.meta.url), "utf8");
} catch (error) {
  if (error?.code === "ENOENT") {
    assert.fail("favicon.svg should exist for the Pixal3D browser tab icon");
  }

  throw error;
}

const seoDescription =
  "Generate 3D model assets with Pixal3D, an AI-powered workspace for exploring 3D creation, visual prototyping, and creative production.";
const crawlableCopy = html.replace(/\s(?:src|href)="[^"]*"/gi, "");

assert.match(
  html,
  /<iframe[^>]+src="https:\/\/tencentarc-pixal3d\.hf\.space[^"]*"/i,
  "index.html should embed the TencentARC/Pixal3D Space runtime in an iframe",
);

assert.match(
  html,
  /<iframe[^>]+title="Pixal3D AI 3D model generation workspace"/i,
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

assert.match(
  html,
  new RegExp(`<meta\\s+name="description"\\s+content="${seoDescription.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*\\/?>`, "i"),
  "page should use a conventional AI 3D site meta description",
);

assert.match(
  html,
  new RegExp(`<meta\\s+property="og:description"\\s+content="${seoDescription.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*\\/?>`, "i"),
  "page should use the same clean Open Graph description",
);

assert.doesNotMatch(
  crawlableCopy,
  /\b(MVP|Hugging Face|HuggingFace|TencentARC|official)\b/i,
  "crawlable page text and metadata should not mention MVP, Hugging Face, TencentARC, or official status",
);

assert.match(
  html,
  /<link[^>]+rel="icon"[^>]+href="\.\/favicon\.svg"[^>]*>/i,
  "index.html should reference favicon.svg as the browser tab icon",
);

assert.match(
  favicon,
  /<svg[^>]+viewBox="0 0 64 64"[\s\S]+<polygon/i,
  "favicon.svg should be a compact SVG icon with geometric Pixal3D cube shapes",
);
