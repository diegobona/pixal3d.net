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

let css = "";
try {
  css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
} catch (error) {
  if (error?.code === "ENOENT") {
    assert.fail("styles.css should exist for the Pixal3D page theme");
  }

  throw error;
}

let appJs = "";
try {
  appJs = await readFile(new URL("../app.js", import.meta.url), "utf8");
} catch (error) {
  if (error?.code === "ENOENT") {
    assert.fail("app.js should exist for the Gradio API integration");
  }

  throw error;
}

const seoDescription =
  "Generate 3D model assets with Pixal3D, an AI-powered workspace for exploring 3D creation, visual prototyping, and creative production.";
const crawlableCopy = html.replace(/\s(?:src|href)="[^"]*"/gi, "");

assert.match(
  html,
  /<script\s+type="module"\s+src="\.\/app\.js"><\/script>/i,
  "index.html should load the Gradio API integration script",
);

assert.match(
  html,
  /<input[^>]+id="image-input"[^>]+type="file"[^>]+accept="image\/\*"[^>]*>/i,
  "page should provide an image upload input for API generation",
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
  /<h1>\s*Pixal3D Image to 3D Generator\s*<\/h1>/i,
  "header title should use the requested Pixal3D image-to-3D generator wording",
);

assert.match(
  html,
  /<img\s+class="brand-logo"\s+src="\.\/favicon\.svg"\s+alt="Pixal3D logo"\s*\/?>/i,
  "header should show the Pixal3D logo before the title",
);

assert.doesNotMatch(
  html,
  /status-dot|Workspace actions|Embedded AI 3D workspace/i,
  "header should not show a decorative status dot",
);

assert.match(
  html,
  /<p\s+class="tagline">\s*Turn Any Image into a Realistic 3D Model\s*<\/p>/i,
  "header tagline should highlight the realistic image-to-3D model workflow",
);

assert.doesNotMatch(
  html,
  /<p\s+class="tagline">\s*AI 3D Model Generator\s*<\/p>/i,
  "header tagline should not use a generic AI 3D generator label",
);

assert.match(
  html,
  /AI[^<]*3D|3D[^<]*AI|Image-to-3D|Generate 3D Model/i,
  "page should present the site as an AI 3D or image-to-3D experience",
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

assert.match(
  css,
  /color-scheme:\s*dark/i,
  "page chrome should use a dark color scheme matching the embedded Pixal3D workspace",
);

assert.match(
  css,
  /--bg:\s*#0b111d/i,
  "outer page background should use the same deep blue-gray family as the embedded app",
);

assert.doesNotMatch(
  css,
  /\.topbar\s*{[\s\S]*background:\s*rgba\(255,\s*255,\s*255/i,
  "topbar should not use a white translucent background",
);

assert.match(
  css,
  /\.topbar\s*{[\s\S]*background:\s*linear-gradient\(180deg,\s*#182132,\s*#111827\)/i,
  "topbar should use a dark Pixal3D-aligned gradient",
);

assert.match(
  css,
  /\.brand-logo\s*{[\s\S]*width:\s*48px;[\s\S]*height:\s*48px;/i,
  "header logo should use a stable 48px square size",
);

assert.doesNotMatch(
  css,
  /\.status-dot|\.actions\s*{/i,
  "styles should not keep unused status dot or action container rules",
);

assert.match(
  appJs,
  /@gradio\/client@2\.2\.0\/\+esm/i,
  "app.js should import the Gradio client from a browser-compatible CDN",
);

assert.match(
  appJs,
  /SPACE_URL\s*=\s*"https:\/\/tencentarc-pixal3d\.hf\.space"[\s\S]*Client\.connect\(SPACE_URL/i,
  "app.js should connect to the public Pixal3D hf.space Gradio endpoint",
);

for (const endpoint of ["/preprocess", "/generate_3d", "/extract_glb_api"]) {
  assert.match(
    appJs,
    new RegExp(endpoint.replace("/", "\\/")),
    `app.js should call the ${endpoint} endpoint`,
  );
}
