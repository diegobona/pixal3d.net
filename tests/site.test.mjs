import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const siteUrl = "https://pixal3d.net";
const homeTitle = "Pixal3D Image to 3D Generator | Free AI 3D Model Generator";
const homeDescription =
  "Turn images into 3D models online with Pixal3D. Create AI 3D model assets for GLB, STL, games, visual prototypes, and creative 3D workflows.";

async function readProjectFile(path, label = path) {
  try {
    return await readFile(new URL(path, root), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      assert.fail(`${label} should exist`);
    }

    throw error;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function withoutAssetUrls(value) {
  return value.replace(/\s(?:src|href)="[^"]*"/gi, "");
}

function assertMeta(html, name, content, label) {
  assert.match(
    html,
    new RegExp(
      `<meta\\s+name="${escapeRegExp(name)}"\\s+content="${escapeRegExp(content)}"\\s*\\/?>`,
      "i",
    ),
    label,
  );
}

function assertCanonical(html, url, label) {
  assert.match(
    html,
    new RegExp(`<link\\s+rel="canonical"\\s+href="${escapeRegExp(url)}"\\s*\\/?>`, "i"),
    label,
  );
}

function assertNoRiskyClaims(html, label) {
  assert.doesNotMatch(
    withoutAssetUrls(html),
    /\b(MVP|Hugging Face|HuggingFace|TencentARC|official)\b/i,
    `${label} should not contain MVP, Hugging Face, TencentARC, or official claims in crawlable copy`,
  );
}

const html = await readProjectFile("index.html", "index.html");
const css = await readProjectFile("styles.css", "styles.css");
const favicon = await readProjectFile("favicon.svg", "favicon.svg");
const robots = await readProjectFile("robots.txt", "robots.txt");
const sitemap = await readProjectFile("sitemap.xml", "sitemap.xml");

const toolPages = [
  {
    path: "image-to-3d-model/index.html",
    url: `${siteUrl}/image-to-3d-model/`,
    title: "Image to 3D Model Generator | Pixal3D",
    description:
      "Convert an image into a 3D model workflow with Pixal3D. Start from a reference image, generate a 3D asset, and prepare it for creative use.",
    h1: "Image to 3D Model Generator",
  },
  {
    path: "ai-3d-model-generator/index.html",
    url: `${siteUrl}/ai-3d-model-generator/`,
    title: "AI 3D Model Generator | Pixal3D",
    description:
      "Use Pixal3D as an AI 3D model generator for visual prototypes, game assets, product concepts, and image-to-3D creative workflows.",
    h1: "AI 3D Model Generator",
  },
  {
    path: "image-to-glb/index.html",
    url: `${siteUrl}/image-to-glb/`,
    title: "Image to GLB Converter Workflow | Pixal3D",
    description:
      "Create a 3D model from an image and prepare it for GLB workflows with Pixal3D. Useful for web, game, AR, and interactive 3D assets.",
    h1: "Image to GLB Converter Workflow",
  },
  {
    path: "image-to-stl/index.html",
    url: `${siteUrl}/image-to-stl/`,
    title: "Image to STL for 3D Printing | Pixal3D",
    description:
      "Turn a reference image into a 3D model workflow for STL preparation. Use Pixal3D for image-to-3D assets and 3D printing concepts.",
    h1: "Image to STL for 3D Printing",
  },
  {
    path: "pixal3d-alternative/index.html",
    url: `${siteUrl}/pixal3d-alternative/`,
    title: "Pixal3D Alternative for Image to 3D | Pixal3D.net",
    description:
      "Explore Pixal3D.net as an independent image-to-3D tool site for AI 3D model generation, GLB/STL workflows, and creative 3D assets.",
    h1: "Pixal3D Alternative for Image to 3D",
  },
];

assert.match(
  html,
  /<html\s+lang="en">/i,
  "home page should be English-first for SEO",
);

assert.match(
  html,
  new RegExp(`<title>\\s*${escapeRegExp(homeTitle)}\\s*<\\/title>`, "i"),
  "home page should use the planned SEO title",
);

assertMeta(
  html,
  "description",
  homeDescription,
  "home page should use the planned SEO meta description",
);

assertCanonical(html, `${siteUrl}/`, "home page should set a canonical URL");

assert.match(
  html,
  /<main\s+class="workspace"\s+id="generator">/i,
  "home iframe section should expose #generator for tool page CTAs",
);

assert.match(
  html,
  /<iframe[^>]+src="https:\/\/tencentarc-pixal3d-server\.hf\.space\/\?__theme=dark"[^>]*>/i,
  "index.html should still embed the Pixal3D-Server hf.space app in an iframe",
);

for (const section of ["What Pixal3D does", "How to use Pixal3D", "Formats and workflows", "FAQ", "Related AI 3D tools"]) {
  assert.match(html, new RegExp(`>\\s*${escapeRegExp(section)}\\s*<`, "i"), `home page should include ${section}`);
}

assert.match(
  html,
  /<a\s+class="seo-card"[^>]+href="\.\/image-to-3d-model\/"/i,
  "home page should link to related static SEO tool pages",
);

assertNoRiskyClaims(html, "home page");

assert.match(
  favicon,
  /<svg[^>]+viewBox="0 0 64 64"[\s\S]+<polygon/i,
  "favicon.svg should be a compact SVG icon with geometric Pixal3D cube shapes",
);

assert.match(css, /color-scheme:\s*dark/i, "page chrome should use a dark color scheme");
assert.match(css, /\.seo-section\s*{/i, "styles should include SEO content sections");
assert.match(css, /\.tool-hero\s*{/i, "styles should include tool page hero layout");
assert.match(css, /\.faq-list\s*{/i, "styles should include FAQ styling");
assert.match(css, /\.cta-panel\s*{/i, "styles should include CTA panel styling");
assert.match(css, /\.related-grid\s*{/i, "styles should include related-link card styling");
assert.doesNotMatch(css, /\.api-studio|\.control-panel|\.result-panel/i, "styles should not keep retired API UI rules");

for (const page of toolPages) {
  const pageHtml = await readProjectFile(page.path, page.path);

  assert.match(pageHtml, /<html\s+lang="en">/i, `${page.path} should be English-first`);
  assert.match(
    pageHtml,
    new RegExp(`<title>\\s*${escapeRegExp(page.title)}\\s*<\\/title>`, "i"),
    `${page.path} should have its planned title`,
  );
  assertMeta(pageHtml, "description", page.description, `${page.path} should have its planned description`);
  assertCanonical(pageHtml, page.url, `${page.path} should have a canonical URL`);
  assert.match(
    pageHtml,
    new RegExp(`<h1>\\s*${escapeRegExp(page.h1)}\\s*<\\/h1>`, "i"),
    `${page.path} should have the planned H1`,
  );
  assert.match(pageHtml, />\s*3-step workflow\s*</i, `${page.path} should include a three-step usage section`);
  assert.match(pageHtml, />\s*Use cases\s*</i, `${page.path} should include use cases`);
  assert.match(pageHtml, />\s*FAQ\s*</i, `${page.path} should include FAQ`);
  assert.match(
    pageHtml,
    /<a\s+class="primary-cta"\s+href="\/#generator">/i,
    `${page.path} should CTA back to the home generator`,
  );
  assert.doesNotMatch(
    pageHtml,
    /<iframe/i,
    `${page.path} should not duplicate the embedded generator iframe`,
  );
  assertNoRiskyClaims(pageHtml, page.path);
}

assert.match(robots, /User-agent:\s*\*/i, "robots.txt should allow crawlers");
assert.match(robots, /Allow:\s*\//i, "robots.txt should allow the site");
assert.match(
  robots,
  new RegExp(`Sitemap:\\s*${escapeRegExp(`${siteUrl}/sitemap.xml`)}`, "i"),
  "robots.txt should point to the sitemap",
);

for (const url of [`${siteUrl}/`, ...toolPages.map((page) => page.url)]) {
  assert.match(sitemap, new RegExp(`<loc>${escapeRegExp(url)}<\\/loc>`, "i"), `sitemap should include ${url}`);
}
