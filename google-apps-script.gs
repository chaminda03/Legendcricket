/**
 * ============================================================================
 *  Virginia Legends — Team registration -> Google Sheets
 * ============================================================================
 *  This script receives registrations from the website's form and appends each
 *  one as a row in your Google Sheet. It also lets the site's /admin page read
 *  them back.
 *
 *  SETUP (about 5 minutes):
 *  1. Create a new Google Sheet (sheet.new). Give it any name.
 *  2. In that sheet: Extensions -> Apps Script.
 *  3. Delete any sample code, paste ALL of this file, and click Save.
 *  4. Click Deploy -> New deployment.
 *       - Type:            Web app
 *       - Execute as:      Me
 *       - Who has access:  Anyone
 *     Click Deploy, then Authorize access (allow the permissions).
 *  5. Copy the "Web app URL" (ends in /exec).
 *  6. In the website project, put it in your .env file:
 *       VITE_SHEETS_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
 *  7. Restart the dev server. Submit a test team — it appears in the sheet. ✅
 *
 *  If you change this script later, redeploy: Deploy -> Manage deployments ->
 *  edit the existing one -> Version: New version -> Deploy (keeps the same URL).
 * ============================================================================
 */

var SHEET_NAME = 'Registrations'
var HEADERS = ['Timestamp', 'Team Name', 'Captain', 'Captain Phone', 'Captain Email', 'Vice-Captain', 'Vice-Captain Phone', 'Players', 'Notes']

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME)
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS)
  return sheet
}

// Receives a registration (called by the website form).
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    getSheet_().appendRow([
      new Date(),
      data.team_name || '',
      data.captain_name || '',
      data.captain_phone || '',
      data.captain_email || '',
      data.vice_captain_name || '',
      data.vice_captain_phone || '',
      data.players || '',
      data.notes || '',
    ])
    return json_({ ok: true })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

// Returns all registrations as JSON (used by the site's /admin page).
function doGet() {
  var values = getSheet_().getDataRange().getValues()
  var rows = values.slice(1).map(function (r) {
    return {
      created_at: r[0], team_name: r[1], captain_name: r[2], captain_phone: r[3],
      captain_email: r[4], vice_captain_name: r[5], vice_captain_phone: r[6],
      players: r[7], notes: r[8],
    }
  })
  return json_({ ok: true, rows: rows.reverse() })
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
