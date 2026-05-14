import { Client, handle_file } from "https://cdn.jsdelivr.net/npm/@gradio/client@2.2.0/+esm";

const SPACE_URL = "https://tencentarc-pixal3d.hf.space";
const DEFAULT_GENERATION = {
  ss_guidance_strength: 7.5,
  ss_guidance_rescale: 0.7,
  ss_sampling_steps: 12,
  ss_rescale_t: 5,
  shape_slat_guidance_strength: 7.5,
  shape_slat_guidance_rescale: 0.5,
  shape_slat_sampling_steps: 12,
  shape_slat_rescale_t: 3,
  tex_slat_guidance_strength: 1,
  tex_slat_guidance_rescale: 0,
  tex_slat_sampling_steps: 12,
  tex_slat_rescale_t: 3,
};

const form = document.querySelector("#pixal3d-form");
const imageInput = document.querySelector("#image-input");
const seedInput = document.querySelector("#seed-input");
const resolutionInput = document.querySelector("#resolution-input");
const statusText = document.querySelector("#api-status");
const previewImage = document.querySelector("#preview-image");
const previewEmpty = document.querySelector("#preview-empty");
const output = document.querySelector("#api-output");
const downloadLink = document.querySelector("#download-link");

let clientPromise;

function setStatus(message) {
  statusText.textContent = message;
}

function setOutput(value) {
  output.textContent = value ? JSON.stringify(value, null, 2) : "";
}

function getClient() {
  if (!clientPromise) {
    clientPromise = Client.connect(SPACE_URL, { events: ["data", "status"] });
  }

  return clientPromise;
}

function findFirstUrl(value, matcher = () => true) {
  if (!value || typeof value !== "object") return "";
  if (typeof value.url === "string" && matcher(value.url)) return value.url;

  for (const item of Object.values(value)) {
    const found = Array.isArray(item)
      ? item.map((entry) => findFirstUrl(entry, matcher)).find(Boolean)
      : findFirstUrl(item, matcher);
    if (found) return found;
  }

  return "";
}

function findStatePath(value) {
  if (!value || typeof value !== "object") return "";
  if (typeof value.state_path === "string") return value.state_path;
  if (typeof value.path === "string" && value.path.includes("state")) return value.path;

  for (const item of Object.values(value)) {
    const found = Array.isArray(item)
      ? item.map(findStatePath).find(Boolean)
      : findStatePath(item);
    if (found) return found;
  }

  return "";
}

async function readSubmission(submission, stage) {
  let latestData = null;

  for await (const message of submission) {
    if (message.type === "status") {
      if (message.stage === "error") {
        throw new Error(message.message || `${stage} failed`);
      }

      const queueInfo = Number.isFinite(message.position)
        ? ` Queue position: ${message.position + 1}.`
        : "";
      setStatus(`${stage}: ${message.stage}.${queueInfo}`);
    }

    if (message.type === "data") {
      latestData = message.data;
      setOutput(latestData);
    }
  }

  return latestData;
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;

  previewImage.src = URL.createObjectURL(file);
  previewImage.hidden = false;
  previewEmpty.hidden = true;
  downloadLink.hidden = true;
  setOutput(null);
  setStatus("Image ready. Start generation when you are ready.");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = imageInput.files?.[0];
  if (!file) {
    setStatus("Choose an image first.");
    return;
  }

  form.classList.add("is-busy");
  downloadLink.hidden = true;
  setOutput(null);

  try {
    setStatus("Connecting to the public Pixal3D Gradio API...");
    const client = await getClient();

    setStatus("Preprocessing image...");
    const preprocessResult = await client.predict("/preprocess", {
      image: handle_file(file),
    });

    const preprocessedImage = preprocessResult?.data?.[0] || handle_file(file);
    setOutput(preprocessResult?.data);

    const sessionId = `pixal3d-${crypto.randomUUID()}`;
    const generationPayload = {
      image: preprocessedImage,
      seed: Number(seedInput.value || 42),
      resolution: Number(resolutionInput.value || 1536),
      ...DEFAULT_GENERATION,
      session_id: sessionId,
    };

    setStatus("Generating 3D state. This can take a while on the public Space...");
    const generatedData = await readSubmission(
      client.submit("/generate_3d", generationPayload),
      "Generating",
    );

    const statePath = findStatePath(generatedData);
    if (!statePath) {
      setStatus("Generation returned data, but no extractable state path was found.");
      return;
    }

    setStatus("Extracting GLB file...");
    const glbResult = await client.predict("/extract_glb_api", {
      state_path: statePath,
      decimation_target: 200000,
      texture_size: 1024,
      session_id: sessionId,
    });

    const glbUrl = findFirstUrl(glbResult?.data, (url) => url.includes(".glb") || url.includes("file="));
    setOutput({ generatedData, glb: glbResult?.data });

    if (glbUrl) {
      downloadLink.href = glbUrl;
      downloadLink.hidden = false;
      setStatus("Done. Your GLB file is ready.");
    } else {
      setStatus("Extraction finished, but no downloadable GLB URL was found.");
    }
  } catch (error) {
    setStatus(
      `The public Space API returned an error: ${error.message}. Open the full generator if this Space requires a top-level session.`,
    );
  } finally {
    form.classList.remove("is-busy");
  }
});
