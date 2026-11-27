// ==========================================
// 1. EMAILJS CONFIGURATION (Keep your keys!)
// ==========================================
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ==========================================
// 2. ZITO DEBT COUNTER (Starts at €50, +€50 per QR)
// ==========================================
const debtAmountEl = document.getElementById("debt-amount");

let currentDebt = parseInt(localStorage.getItem("zitoDebt"), 10);
if (isNaN(currentDebt)) {
  currentDebt = 50;
}

function updateDebtDisplay() {
  debtAmountEl.textContent = currentDebt;
  localStorage.setItem("zitoDebt", currentDebt);
}

updateDebtDisplay();

// ==========================================
// 3. QR CODE GENERATION & EMAIL SENDING
// ==========================================
const form = document.getElementById("qr-form");
const linkInput = document.getElementById("link-input");
const emailInput = document.getElementById("email-input");
const generateBtn = document.getElementById("generate-btn");
const resultArea = document.getElementById("result-area");
const qrcodeBox = document.getElementById("qrcode-box");
const statusMsg = document.getElementById("status-msg");
const downloadLink = document.getElementById("download-link");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = linkInput.value.trim();
  const recipientEmail = emailInput.value.trim() || "edchantre@gmail.com";

  if (!url) return;

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>Generating & sending...</span>';
  statusMsg.classList.remove("error");
  statusMsg.textContent = "";

  // Add €50 to Zito's counter every time a QR code is generated
  currentDebt += 50;
  updateDebtDisplay();

  // Clear previous QR code
  qrcodeBox.innerHTML = "";

  // Generate new QR code
  new QRCode(qrcodeBox, {
    text: url,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Wait briefly for canvas to render
  setTimeout(async () => {
    const canvas = qrcodeBox.querySelector("canvas");
    const qrDataUrl = canvas ? canvas.toDataURL("image/png") : "";

    if (qrDataUrl) {
      downloadLink.href = qrDataUrl;
    }

    resultArea.classList.remove("hidden");

    const qrEmailImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

    // Send email via EmailJS
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: recipientEmail,
        qr_link: url,
        qr_image: qrEmailImageUrl,
      });

      statusMsg.textContent = `QR code sent to ${recipientEmail}!`;
    } catch (error) {
      console.error("EmailJS error:", error);
      statusMsg.classList.add("error");
      statusMsg.textContent = `Error: ${error.text || "Check EmailJS keys in script.js"}`;
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<span>Generate QR code</span><span class="cost-badge">-50€</span>';
    }
  }, 150);
});