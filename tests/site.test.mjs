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

const seoDescription =
  "Generate 3D model assets with Pixal3D, an AI-powered workspace for exploring 3D creation, visual prototyping, and creative production.";
const crawlableCopy = html.replace(/\s(?:src|href)="[^"]*"/gi, "");

assert.match(
  html,
  /<iframe[^>]+src="https:\/\/tencentarc-pixal3d-server\.hf\.space\/\?__theme=system"[^>]*>/i,
  "index.html should embed the Pixal3D-Server hf.space app in an iframe",
);

assert.match(
  html,
  /<div\s+class="frame-shell">\s*<iframe[\s\S]*?<\/iframe>\s*<div\s+class="iframe-warning-mask"\s+aria-hidden="true"><\/div>\s*<\/div>/i,
  "iframe should be wrapped with a decorative mask layer for the embedded warning area",
);

assert.doesNotMatch(
  html,
  /<script\s+type="module"\s+src="\.\/app\.js"><\/script>|id="pixal3d-form"|id="image-input"/i,
  "page should not load the retired Gradio API form or script",
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

assert.match(
  html,
  /<p\s+class="loading-note"\s+role="note">\s*If the &quot;Start Generation&quot; button is disabled, please wait a few seconds to tens of seconds while the server finishes loading\.\s*<\/p>/i,
  "page should show a visible English note with the Start Generation button name in quotes",
);

assert.doesNotMatch(
  html,
  /<p\s+class="tagline">\s*AI 3D Model Generator\s*<\/p>/i,
  "header tagline should not use a generic AI 3D generator label",
);

assert.match(
  html,
  /AI[^<]*3D|3D[^<]*AI|Image-to-3D/i,
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

assert.match(
  css,
  /\.loading-note\s*{[\s\S]*background:\s*linear-gradient\(135deg,\s*rgba\(45,\s*212,\s*191,\s*0\.16\),\s*rgba\(99,\s*102,\s*241,\s*0\.16\)\)/i,
  "loading note should be styled as a prominent Pixal3D-themed notice",
);

assert.match(
  css,
  /\.frame-shell\s*{[\s\S]*position:\s*relative;[\s\S]*overflow:\s*hidden;/i,
  "iframe wrapper should establish a clipped positioning context for the warning mask",
);

assert.match(
  css,
  /\.iframe-warning-mask\s*{[\s\S]*position:\s*absolute;[\s\S]*height:\s*38px;[\s\S]*background:\s*#090d18;[\s\S]*box-shadow:\s*none;[\s\S]*pointer-events:\s*none;/i,
  "warning mask should be a narrow iframe-colored strip that does not block iframe clicks",
);

assert.doesNotMatch(
  css,
  /\.status-dot|\.actions\s*{/i,
  "styles should not keep unused status dot or action container rules",
);

assert.match(
  css,
  /\.space-frame\s*{[\s\S]*height:\s*calc\(100vh - 76px - clamp\(20px,\s*4vw,\s*36px\)\)/i,
  "styles should size the iframe as the primary workspace",
);

assert.doesNotMatch(
  css,
  /\.api-studio|\.control-panel|\.result-panel/i,
  "styles should not keep retired API UI rules",
);
