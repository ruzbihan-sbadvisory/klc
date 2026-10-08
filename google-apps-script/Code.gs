/**
 * Borang "Submit Message" laman KLC -> Google Sheets
 *
 * CARA GUNA (sekali sahaja):
 * 1. Buka Google Sheet baharu > Extensions > Apps Script.
 * 2. Padam semua kod sedia ada, tampal SEMUA kod ini, tekan Save.
 * 3. Pilih fungsi "setup" di atas, tekan Run. Benarkan (Allow) bila diminta.
 *    Tab "Inquiries" akan dicipta dengan header.
 * 4. Deploy > New deployment > jenis "Web app"
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Salin URL Web app (berakhir /exec) dan tampal di panel admin:
 *    Tetapan Laman > Tetapan Umum > Borang hubungi > URL Google Apps Script
 *
 * Kalau nak terima emel setiap kali ada mesej, isi NOTIFY_EMAIL.
 */
const SHEET_NAME = 'Inquiries';
const NOTIFY_EMAIL = ''; // contoh: 'advisory@kurnialestari.com.my'
const HEADERS = ['Timestamp', 'First Name', 'Last Name', 'Email', 'Company', 'Message', 'Page', 'Status'];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#1C2D42').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.setColumnWidth(6, 420);
  const status = SpreadsheetApp.newDataValidation().requireValueInList(['New', 'Contacted', 'Closed'], true).build();
  sh.getRange(2, 8, 1000, 1).setDataValidation(status);
  SpreadsheetApp.getUi && Logger.log('Setup siap. Tab "' + SHEET_NAME + '" sedia.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const p = (e && e.parameter) || {};
    const clean = v => String(v || '').slice(0, 5000).replace(/^[=+\-@]/, "'$&"); // elak formula injection
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || (setup(), ss.getSheetByName(SHEET_NAME));
    sh.appendRow([new Date(), clean(p.firstName), clean(p.lastName), clean(p.email), clean(p.company), clean(p.message), clean(p.page), 'New']);
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'Mesej baharu dari laman web: ' + clean(p.firstName) + ' ' + clean(p.lastName),
        'Nama: ' + p.firstName + ' ' + p.lastName + '\nEmel: ' + p.email + '\nSyarikat: ' + (p.company || '-') + '\n\n' + p.message);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
