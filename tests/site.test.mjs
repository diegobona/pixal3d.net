import { readFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const siteUrl = "https://pixal3d.net";
const homeTitle = "Pixal3D Image to 3D Generator | Free AI 3D Model Generator";
const homeTagline = "Turn Any Image into a Faithful 3D Model Online";
const homeDescription =
  "Turn images into 3D models online with Pixal3D. Create AI 3D model assets for GLB, STL, games, visual prototypes, and creative 3D projects.";

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

async function assertProjectFileExists(path, label = path) {
  try {
    await stat(new URL(path, root));
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

function assertNoWorkflowLanguage(html, label) {
  assert.doesNotMatch(
    withoutAssetUrls(html),
    /\bworkflows?\b/i,
    `${label} should avoid workflow language in crawlable copy`,
  );
}

const html = await readProjectFile("index.html", "index.html");
const css = await readProjectFile("styles.css", "styles.css");
const favicon = await readProjectFile("favicon.svg", "favicon.svg");
const robots = await readProjectFile("robots.txt", "robots.txt");
const sitemap = await readProjectFile("sitemap.xml", "sitemap.xml");
const redirects = await readProjectFile("_redirects", "_redirects");

const blogPages = [
  {
    oldPath: "/image-to-3d-model/",
    path: "blog/image-to-3d-model/index.html",
    url: `${siteUrl}/blog/image-to-3d-model/`,
    title: "Image to 3D Model Guide | Pixal3D Blog",
    description:
      "A Pixal3D blog guide to image-to-3D generation, including source image tips, expected results, and when to use the generator.",
    h1: "Image to 3D Model Guide",
  },
  {
    oldPath: "/ai-3d-model-generator/",
    path: "blog/ai-3d-model-generator/index.html",
    url: `${siteUrl}/blog/ai-3d-model-generator/`,
    title: "AI 3D Model Generator Guide | Pixal3D Blog",
    description:
      "A Pixal3D blog guide to AI 3D model generation for visual prototypes, game assets, product concepts, and image-to-3D tests.",
    h1: "AI 3D Model Generator Guide",
  },
  {
    oldPath: "/image-to-glb/",
    path: "blog/image-to-glb/index.html",
    url: `${siteUrl}/blog/image-to-glb/`,
    title: "Image to GLB Guide | Pixal3D Blog",
    description:
      "A Pixal3D blog guide to GLB files, web previews, game prototypes, AR scenes, and image-generated 3D assets.",
    h1: "Image to GLB Guide",
  },
  {
    oldPath: "/image-to-stl/",
    path: "blog/image-to-stl/index.html",
    url: `${siteUrl}/blog/image-to-stl/`,
    title: "Image to STL Guide | Pixal3D Blog",
    description:
      "A Pixal3D blog guide to STL files, 3D printing preparation, mesh checks, and image-generated 3D model drafts.",
    h1: "Image to STL Guide",
  },
  {
    oldPath: "/pixal3d-alternative/",
    path: "blog/pixal3d-alternative/index.html",
    url: `${siteUrl}/blog/pixal3d-alternative/`,
    title: "Pixal3D Alternative Guide | Pixal3D Blog",
    description:
      "A Pixal3D blog guide for people comparing image-to-3D generators, AI 3D model tools, and Pixal3D alternatives.",
    h1: "Pixal3D Alternative Guide",
  },
];

const galleryImages = [
  "assets/model-gallery/model-01.png",
  "assets/model-gallery/model-02.png",
  "assets/model-gallery/model-03.png",
  "assets/model-gallery/model-04.webp",
  "assets/model-gallery/model-05.webp",
  "assets/model-gallery/model-07.png",
  "assets/model-gallery/model-09.webp",
  "assets/model-gallery/model-10.webp",
  "assets/model-gallery/model-11.png",
  "assets/model-gallery/model-12.png",
  "assets/model-gallery/model-13.png",
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

assert.match(
  html,
  /<h1>\s*Pixal3D Image to 3D Generator\s*<\/h1>/i,
  "home page should keep the Pixal3D image-to-3D H1 stable",
);

assert.match(
  html,
  new RegExp(`<p\\s+class="tagline">\\s*${escapeRegExp(homeTagline)}\\s*<\\/p>`, "i"),
  "home page should use the faithfulness-focused subtitle",
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

assert.doesNotMatch(
  html,
  /<nav\s+class="topnav"[^>]*>[\s\S]*?<a\s+href="#generator"[\s\S]*?Generator[\s\S]*?<\/nav>/i,
  "home top navigation should not include a redundant Generator self-link",
);

assert.match(
  html,
  /<a\s+href="#pixal3d-advantages">\s*Features\s*<\/a>/i,
  "home navigation should lead with the Pixal3D features section",
);

assert.doesNotMatch(
  html,
  /<nav\s+class="topnav"[^>]*>[\s\S]*?<a\s+href="#how-it-works"[\s\S]*?How it works[\s\S]*?<\/nav>/i,
  "home top navigation should not promote How it works for a simple generator",
);

assert.doesNotMatch(
  html,
  /<nav\s+class="topnav"[^>]*>[\s\S]*?<a\s+href="#pixal3d-advantages"[\s\S]*?Advantages[\s\S]*?<\/nav>/i,
  "home top navigation should use Features instead of Advantages",
);

assert.match(
  html,
  /<iframe[^>]+src="https:\/\/tencentarc-pixal3d-server\.hf\.space\/\?__theme=dark"[^>]*>/i,
  "index.html should still embed the Pixal3D-Server hf.space app in an iframe",
);

assert.match(
  html,
  /<div\s+class="iframe-warning-mask"\s+aria-hidden="true"><\/div>/i,
  "home iframe shell should include a visual-only mask for remote warning copy",
);

for (const section of [
  "Why choose Pixal3D",
  "3D models created by our AI",
  "How to use Pixal3D",
  "FAQ",
  "Pixal3D Blog",
]) {
  assert.match(html, new RegExp(`>\\s*${escapeRegExp(section)}\\s*<`, "i"), `home page should include ${section}`);
}

assert.match(
  html,
  /<section\s+class="model-gallery"\s+aria-labelledby="model-gallery-title">/i,
  "home page should include a model gallery section between features and usage content",
);

assert.match(
  html,
  /<h2\s+id="model-gallery-title">\s*3D models created by our AI\s*<\/h2>/i,
  "model gallery should use the requested title",
);

assert.match(
  html,
  /<div\s+class="model-gallery-viewport"\s+aria-label="AI-created 3D model examples">/i,
  "model gallery should use a viewport for horizontal scrolling",
);

assert.match(
  html,
  /<div\s+class="model-gallery-track">/i,
  "model gallery should use an animated track for slow horizontal scrolling",
);

assert.ok(
  (html.match(/<figure\s+class="model-gallery-card"/gi) ?? []).length >= galleryImages.length * 2,
  "model gallery should duplicate the image set for a continuous auto-scroll effect",
);

assert.match(
  html,
  /<div\s+class="model-gallery-loop"\s+aria-hidden="true">/i,
  "model gallery should hide the duplicated image set from assistive technology",
);

for (const imagePath of galleryImages) {
  await assertProjectFileExists(imagePath, imagePath);
  assert.match(
    html,
    new RegExp(`<img\\s+class="model-shot"[^>]+src="\\.\\/${escapeRegExp(imagePath)}"`, "i"),
    `home gallery should render local image ${imagePath}`,
  );
}

assert.match(
  html,
  /<a\s+href="#blog">\s*Blog\s*<\/a>/i,
  "home navigation should point to the blog section",
);

for (const removedHomeCopy of [
  "Why creators choose Pixal3D",
  "Pixal3D focuses on image-to-3D results",
  "Related AI 3D tools",
  "What Pixal3D does",
  "Formats and workflows",
  "SEO tool pages",
]) {
  assert.doesNotMatch(
    html,
    new RegExp(`>\\s*${escapeRegExp(removedHomeCopy)}\\s*<`, "i"),
    `home page should not show the removed ${removedHomeCopy} section copy`,
  );
}

for (const phrase of [
  "Faithful to your image",
  "Pixel-aligned 3D generation",
  "Detailed geometry reconstruction",
  "PBR texture generation",
  "Fast model generation",
  "Complete model generation in about 10 seconds",
  "free online image to 3D model generator",
  "Pixal3D AI",
  "AI 3D model generator",
  "GLB files",
  "STL preparation",
  "Read practical notes about image-to-3D generation",
]) {
  assert.match(
    html,
    new RegExp(escapeRegExp(phrase), "i"),
    `home page should strengthen stable crawlable copy for ${phrase}`,
  );
}

assert.match(
  html,
  /<a\s+class="seo-card"[^>]+href="\.\/blog\/image-to-3d-model\/"/i,
  "home page should link to static blog article pages",
);

assertNoRiskyClaims(html, "home page");
assertNoWorkflowLanguage(html, "home page");

assert.match(
  favicon,
  /<svg[^>]+viewBox="0 0 64 64"[\s\S]+<polygon/i,
  "favicon.svg should be a compact SVG icon with geometric Pixal3D cube shapes",
);

assert.match(css, /color-scheme:\s*dark/i, "page chrome should use a dark color scheme");
assert.match(css, /\.seo-section\s*{/i, "styles should include SEO content sections");
assert.match(css, /\.tool-hero\s*{/i, "styles should include tool page hero layout");
assert.match(css, /\.blog-article\s*{/i, "styles should include readable blog article layout");
assert.match(css, /\.article-toc\s*{/i, "styles should include table-of-contents styling");
assert.match(css, /\.article-note\s*{/i, "styles should include practical article note styling");
assert.match(css, /\.faq-list\s*{/i, "styles should include FAQ styling");
assert.match(css, /\.cta-panel\s*{/i, "styles should include CTA panel styling");
assert.match(css, /\.related-grid\s*{/i, "styles should include related-link card styling");
assert.match(css, /\.model-gallery\s*{/i, "styles should include model gallery section styling");
assert.match(css, /\.model-gallery-viewport\s*{/i, "styles should include model gallery viewport styling");
assert.match(css, /\.model-gallery-track\s*{/i, "styles should include model gallery track styling");
assert.match(css, /\.model-shot\s*{/i, "styles should include stable model shot image sizing");
assert.match(
  css,
  /\.brand-copy\s*{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*4px;/i,
  "header brand copy should use explicit vertical spacing so title and subtitle do not overlap",
);
assert.match(
  css,
  /\.brand-copy\s+h1\s*{[\s\S]*?line-height:\s*1\.08;/i,
  "header H1 should use a relaxed line-height for stable font rendering",
);
assert.match(
  css,
  /\.tagline\s*{[\s\S]*?line-height:\s*1\.28;/i,
  "header subtitle should use an explicit line-height to avoid visual collision",
);
assert.match(css, /@keyframes\s+model-gallery-scroll/i, "styles should define a slow model gallery auto-scroll animation");
assert.match(
  css,
  /\.model-gallery-track\s*{[\s\S]*?animation:\s*model-gallery-scroll/i,
  "model gallery track should run the slow horizontal animation",
);
assert.match(css, /\.iframe-warning-mask\s*{/i, "styles should include iframe warning mask styling");
assert.match(
  css,
  /\.iframe-warning-mask\s*{[\s\S]*?pointer-events:\s*none;/i,
  "iframe warning mask should not block iframe interaction",
);
assert.match(
  css,
  /\.iframe-warning-mask\s*{[\s\S]*?width:\s*min\([^;]+calc\(100%/i,
  "iframe warning mask should use responsive width for different desktop screens",
);
assert.doesNotMatch(css, /\.api-studio|\.control-panel|\.result-panel/i, "styles should not keep retired API UI rules");

for (const page of blogPages) {
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
  assert.doesNotMatch(
    pageHtml,
    /<nav\s+class="topnav"[\s\S]*?<\/nav>/i,
    `${page.path} should keep the article header quiet without top navigation buttons`,
  );
  assert.match(pageHtml, /<article\s+class="blog-article">/i, `${page.path} should use a real article layout`);
  assert.match(pageHtml, />\s*Last updated:\s*May 16, 2026\s*</i, `${page.path} should show a publication freshness marker`);
  assert.match(pageHtml, />\s*Table of contents\s*</i, `${page.path} should include a table of contents`);
  assert.match(pageHtml, />\s*Practical checklist\s*</i, `${page.path} should include actionable checklist content`);
  assert.match(pageHtml, />\s*Common mistakes\s*</i, `${page.path} should include common mistakes`);
  assert.match(pageHtml, />\s*FAQ\s*</i, `${page.path} should include FAQ`);
  assert.match(
    pageHtml,
    /<a\s+class="article-cta"\s+href="\/#generator">/i,
    `${page.path} should CTA back to the home generator`,
  );
  assert.doesNotMatch(pageHtml, /<section\s+class="tool-hero">/i, `${page.path} should not look like a tool landing page`);
  assert.doesNotMatch(pageHtml, /<aside\s+class="cta-panel"/i, `${page.path} should not use a landing-page side panel`);
  assert.doesNotMatch(pageHtml, />\s*3-step workflow\s*</i, `${page.path} should not present as a separate workflow`);
  assert.doesNotMatch(pageHtml, />\s*Use cases\s*</i, `${page.path} should not present as a separate tool use-case page`);
  assert.doesNotMatch(
    pageHtml,
    /<iframe/i,
    `${page.path} should not duplicate the embedded generator iframe`,
  );
  assertNoRiskyClaims(pageHtml, page.path);
  assertNoWorkflowLanguage(pageHtml, page.path);
}

assert.match(robots, /User-agent:\s*\*/i, "robots.txt should allow crawlers");
assert.match(robots, /Allow:\s*\//i, "robots.txt should allow the site");
assert.match(
  robots,
  new RegExp(`Sitemap:\\s*${escapeRegExp(`${siteUrl}/sitemap.xml`)}`, "i"),
  "robots.txt should point to the sitemap",
);

for (const url of [`${siteUrl}/`, ...blogPages.map((page) => page.url)]) {
  assert.match(sitemap, new RegExp(`<loc>${escapeRegExp(url)}<\\/loc>`, "i"), `sitemap should include ${url}`);
}

for (const page of blogPages) {
  assert.doesNotMatch(
    sitemap,
    new RegExp(`<loc>${escapeRegExp(`${siteUrl}${page.oldPath}`)}<\\/loc>`, "i"),
    `sitemap should not keep old root article URL ${page.oldPath}`,
  );

  const newPath = new URL(page.url).pathname;
  assert.match(
    redirects,
    new RegExp(`^${escapeRegExp(page.oldPath)}\\s+${escapeRegExp(newPath)}\\s+301\\s*$`, "m"),
    `_redirects should 301 ${page.oldPath} to ${newPath}`,
  );
}
