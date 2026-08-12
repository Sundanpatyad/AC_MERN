const INQUIRY_EMAIL =
  import.meta.env.VITE_INQUIRY_EMAIL || "awakeningclasses1343@gmail.com";

const INQUIRY_SHEET_URL = import.meta.env.VITE_INQUIRY_SHEET_URL || "";

async function sendInquiryEmail({ name, phone, query }) {
  const response = await fetch(`https://formsubmit.co/ajax/${INQUIRY_EMAIL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      phone,
      message: query,
      _subject: `New inquiry from ${name} - Awakening Classes`,
      _template: "table",
      _captcha: "false",
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to send your inquiry. Please try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (data.success === false) {
    throw new Error(data.message || "Unable to send your inquiry.");
  }

  return data;
}

async function saveInquiryToSheet({ name, phone, query }) {
  if (!INQUIRY_SHEET_URL) return;

  await fetch(INQUIRY_SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      name,
      phone,
      query,
      timestamp: new Date().toISOString(),
      source: "website",
    }),
  });
}

export async function submitInquiry({ name, phone, query }) {
  const [emailResult, sheetResult] = await Promise.allSettled([
    sendInquiryEmail({ name, phone, query }),
    saveInquiryToSheet({ name, phone, query }),
  ]);

  if (emailResult.status === "rejected") {
    throw emailResult.reason;
  }

  if (sheetResult.status === "rejected" && INQUIRY_SHEET_URL) {
    console.warn("Inquiry email sent but sheet save failed:", sheetResult.reason);
  }

  return emailResult.value;
}
