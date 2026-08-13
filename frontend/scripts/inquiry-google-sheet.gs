/**
 * Google Sheets — inquiry log
 *
 * Row 1 headers (exact order):
 * Timestamp | Name | Phone | Query | Source
 *
 * Deploy: Deploy → New deployment → Web app
 * Execute as: Me | Who has access: Anyone
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var body = {};

    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    if (!sheet.getRange(1, 1).getValue()) {
      sheet.appendRow(["Timestamp", "Name", "Phone", "Query", "Source"]);
    }

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
