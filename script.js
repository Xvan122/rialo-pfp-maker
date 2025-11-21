// GANTI dengan URL API Vercel kamu nanti
const API_URL = "https://rialo-pfp-maker11-cx4jin11e-kenzs-projects.vercel.app/";

const nameInput = document.getElementById("name-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const statusEl = document.getElementById("status");
const imgEl = document.getElementById("pfp-image");
const placeholder = document.getElementById("placeholder");

let lastName = "";
let lastImageSrc = "";

generateBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  if (!name) {
    statusEl.textContent = "Masukkan nama dulu, fren.";
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  statusEl.textContent = "Talking to Gemini, sebentar...";
  downloadBtn.disabled = true;
  imgEl.style.display = "none";
  placeholder.style.display = "block";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate PFP");
    }

    const data = await res.json();
    const base64 = data.imageBase64;

    const src = `data:image/png;base64,${base64}`;
    imgEl.src = src;
    imgEl.style.display = "block";
    placeholder.style.display = "none";

    lastImageSrc = src;
    lastName = name;

    downloadBtn.disabled = false;
    statusEl.textContent = "Done. PFP siap kamu download 😎";
  } catch (e) {
    console.error(e);
    statusEl.textContent =
      "Gagal generate PFP. Cek lagi API URL / server Vercel.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate";
  }
});

// tombol download
downloadBtn.addEventListener("click", () => {
  if (!lastImageSrc) return;
  const link = document.createElement("a");
  link.href = lastImageSrc;
  const safeName = lastName || "rialo";
  link.download = `rialo-pfp-${safeName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
