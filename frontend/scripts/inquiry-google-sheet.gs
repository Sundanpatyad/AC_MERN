/**
 * Google Sheets — inquiry log (copy into Extensions → Apps Script on your sheet)
 *
 * 1. Create a Google Sheet with headers in row 1:
 *    Timestamp | Name | Phone | Query | Source
 * 2. Paste this file into Apps Script, save, Deploy → New deployment → Web app
 * 3. Execute as: Me | Who has access: Anyone
 * 4. Copy the web app URL into frontend .env as VITE_INQUIRY_SHEET_URL
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};

    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.name || "",
      body.phone || "",
      body.query || "",
      body.source || "website",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
