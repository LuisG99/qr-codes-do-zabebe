// ==========================================
// 1. EMAILJS CONFIGURATION (Replace these!)
// ==========================================
const EMAILJS_PUBLIC_KEY = "NgmXhpZ18Rc-FQG4n";
const EMAILJS_SERVICE_ID = "service_nea90p8";
const EMAILJS_TEMPLATE_ID = "template_89c1ivu";

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ==========================================
// 2. ZITO DEBT COUNTER (Starts at 50€)
// ==========================================
const debtAmountEl = document.getElementById("debt-amount");
const decreaseBtn = document.getElementById("decrease-btn");
const increaseBtn = document.getElementById("increase-btn");

let currentDebt = parseInt(localStorage.getItem("zitoDebt"), 10);
if (isNaN(currentDebt)) {
  currentDebt = 50;
}

function updateDebtDisplay() {
  debtAmountEl.textContent = currentDebt;
  localStorage.setItem("zitoDebt", currentDebt);
}

decreaseBtn.addEventListener("click", () => {
  if (currentDebt > 0) {
    currentDebt -= 1;
    updateDebtDisplay();
  }
});

increaseBtn.addEventListener("click", () => {
  currentDebt += 1;
  updateDebtDisplay();
});

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
  generateBtn.textContent = "Generating & sending...";
  statusMsg.classList.remove("error");
  statusMsg.textContent = "";

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

    // Send email via EmailJS
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: recipientEmail,
        qr_link: url,
        qr_image: qrDataUrl,
      });

      statusMsg.textContent = `QR code sent to ${recipientEmail}!`;
    } catch (error) {
      console.error("EmailJS error:", error);
      statusMsg.classList.add("error");
      statusMsg.textContent =
        "QR code generated below! (Configure EmailJS keys in script.js to enable email delivery.)";
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate QR code";
    }
  }, 150);
});