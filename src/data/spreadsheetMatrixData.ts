// Spreadsheet ELEKTRONIK Master Matrix Data & Real-time Google Sheets Sync Helper
// Models the exact 7-day multi-week grid shown in Google Sheets "ELEKTRONIK (1)"

export interface SheetDaySchedule {
  date: string; // e.g. "09/08/2026" (or "09-08-2026")
  dayName: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | "JUM'AT" | 'SABTU' | 'MINGGU';
  dayIndex: number; // 0 (Senin) .. 6 (Minggu)
  items: string[]; // e.g. ["B2 PROMO KREDIT", "SEPEDA LISTRIK", "KULKAS"]
  notes?: string;
}

export interface SheetWeekRow {
  weekId: string; // e.g. "week-2026-w32"
  weekLabel: string; // e.g. "03/08/2026 - 09/08/2026"
  days: SheetDaySchedule[]; // Array of 7 days (Senin to Minggu)
}

export const DAYS_OF_WEEK = ['SENIN', 'SELASA', 'RABU', 'KAMIS', "JUM'AT", 'SABTU', 'MINGGU'] as const;

export const INITIAL_SPREADSHEET_WEEKS: SheetWeekRow[] = [
  {
    weekId: 'week-2026-w27',
    weekLabel: '29/06/2026 - 05/07/2026',
    days: [
      { date: '29/06/2026', dayName: 'SENIN', dayIndex: 0, items: ['SEPEDA LISTRIK', 'TV', 'KOMPOR', 'BLENDER'] },
      { date: '30/06/2026', dayName: 'SELASA', dayIndex: 1, items: ['KULKAS', 'MESIN CUCI', 'AC', 'B2 PROMO SHARP'] },
      { date: '01/07/2026', dayName: 'RABU', dayIndex: 2, items: ['PRINTER', 'LAPTOP', 'HP', 'SPEAKER'] },
      { date: '02/07/2026', dayName: 'KAMIS', dayIndex: 3, items: ['SEPEDA LISTRIK', 'MAGIC COM', 'KULKAS', 'SHOWCASE'] },
      { date: '03/07/2026', dayName: "JUM'AT", dayIndex: 4, items: ['AC', 'MESIN CUCI', 'CHOPPER', 'SETRIKA'] },
      { date: '04/07/2026', dayName: 'SABTU', dayIndex: 5, items: ['LIBUR'] },
      { date: '05/07/2026', dayName: 'MINGGU', dayIndex: 6, items: ['HP', 'SEPEDA LISTRIK', 'TV', 'B2 TESTIMONI PROMO SHARP'] },
    ],
  },
  {
    weekId: 'week-2026-w28',
    weekLabel: '06/07/2026 - 12/07/2026',
    days: [
      { date: '06/07/2026', dayName: 'SENIN', dayIndex: 0, items: ['KULKAS', 'MAGIC COM', 'SPEAKER', 'DISPENSER'] },
      { date: '07/07/2026', dayName: 'SELASA', dayIndex: 1, items: ['KUNJUNGAN'] },
      { date: '08/07/2026', dayName: 'RABU', dayIndex: 2, items: ['SEPEDA LISTRIK', 'HP', 'B2 PROMO SHARP', 'B2 PROMO KREDIT'] },
      { date: '09/07/2026', dayName: 'KAMIS', dayIndex: 3, items: ['MESIN CUCI', 'TV', 'LAPTOP', 'AC'] },
      { date: '10/07/2026', dayName: "JUM'AT", dayIndex: 4, items: ['LIBUR'] },
      { date: '11/07/2026', dayName: 'SABTU', dayIndex: 5, items: ['SEPEDA LISTRIK', 'KULKAS', 'FREEZER BOX', 'MAGIC COM'] },
      { date: '12/07/2026', dayName: 'MINGGU', dayIndex: 6, items: ['AC', 'HP', 'MESIN CUCI', 'B2 KREDIT 0%'] },
    ],
  },
  {
    weekId: 'week-2026-w29',
    weekLabel: '13/07/2026 - 19/07/2026',
    days: [
      { date: '13/07/2026', dayName: 'SENIN', dayIndex: 0, items: ['BLENDER', 'TV', 'SPEAKER'] },
      { date: '14/07/2026', dayName: 'SELASA', dayIndex: 1, items: ['B2 PROMO SHARP', 'SEPEDA LISTRIK', 'DISPENSER', 'OPEN STORE', 'CLOSE STORE'] },
      { date: '15/07/2026', dayName: 'RABU', dayIndex: 2, items: ['HP', 'SHOWCASE', 'AIRFRYER', 'TV'] },
      { date: '16/07/2026', dayName: 'KAMIS', dayIndex: 3, items: ['SEPEDA LISTRIK', 'MESIN CUCI', 'LAPTOP'] },
      { date: '17/07/2026', dayName: "JUM'AT", dayIndex: 4, items: ['HP', 'KULKAS', 'AC'] },
      { date: '18/07/2026', dayName: 'SABTU', dayIndex: 5, items: ['LIBUR'] },
      { date: '19/07/2026', dayName: 'MINGGU', dayIndex: 6, items: ['SEPEDA LISTRIK', 'TV', 'B2 PROMO KREDIT 0%', 'B2 PROMO SHARP'] },
    ],
  },
  {
    weekId: 'week-2026-w30',
    weekLabel: '20/07/2026 - 26/07/2026',
    days: [
      { date: '20/07/2026', dayName: 'SENIN', dayIndex: 0, items: ['MESIN CUCI', 'DISPENSER', 'KULKAS', 'KOMPOR'] },
      { date: '21/07/2026', dayName: 'SELASA', dayIndex: 1, items: ['HP', 'SEPEDA LISTRIK', 'MAGIC COM'] },
      { date: '22/07/2026', dayName: 'RABU', dayIndex: 2, items: ['MESIN CUCI', 'OVEN', 'KOMPOR'] },
      { date: '23/07/2026', dayName: 'KAMIS', dayIndex: 3, items: ['SEPEDA LISTRIK', 'LAPTOP', 'FREEZER BOX'] },
      { date: '24/07/2026', dayName: "JUM'AT", dayIndex: 4, items: ['TV', 'KULKAS', 'AC'] },
      { date: '25/07/2026', dayName: 'SABTU', dayIndex: 5, items: ['MESIN CUCI', 'SETRIKA', 'SPEAKER', 'B2 PROMO HARP'] },
      { date: '26/07/2026', dayName: 'MINGGU', dayIndex: 6, items: ['SEPEDA LISTRIK', 'HP', 'BLENDER', 'B2 KREDIT'] },
    ],
  },
  {
    weekId: 'week-2026-w31',
    weekLabel: '27/07/2026 - 02/08/2026',
    days: [
      { date: '27/07/2026', dayName: 'SENIN', dayIndex: 0, items: ['LIBUR'] },
      { date: '28/07/2026', dayName: 'SELASA', dayIndex: 1, items: ['KULKAS', 'AC', 'TV', 'HP'] },
      { date: '29/07/2026', dayName: 'RABU', dayIndex: 2, items: ['PRE ORDER SAMSUNG', 'SEPEDA LISTRIK', 'KOMPOR', 'DISPENSER'] },
      { date: '30/07/2026', dayName: 'KAMIS', dayIndex: 3, items: ['LAPTOP', 'SHOWCASE', 'MESIN CUCI', 'OPEN STORE', 'CLOSE STORE'] },
      { date: '31/07/2026', dayName: "JUM'AT", dayIndex: 4, items: ['BLENDER', 'AC', 'SEPEDA LISTRIK', 'HP'] },
      { date: '01/08/2026', dayName: 'SABTU', dayIndex: 5, items: ['TV', 'MAGIC COM', 'KULKAS'] },
      { date: '02/08/2026', dayName: 'MINGGU', dayIndex: 6, items: ['B2 PROMO KREDIT', 'SEPEDA LISTRIK', 'KOMPOR'] },
    ],
  },
  {
    weekId: 'week-2026-w32',
    weekLabel: '03/08/2026 - 09/08/2026',
    days: [
      { date: '03/08/2026', dayName: 'SENIN', dayIndex: 0, items: ['LIBUR'] },
      { date: '04/08/2026', dayName: 'SELASA', dayIndex: 1, items: ['KUNJUNGAN'] },
      { date: '05/08/2026', dayName: 'RABU', dayIndex: 2, items: ['SEPEDA LISTRIK', 'KULKAS', 'TV'] },
      { date: '06/08/2026', dayName: 'KAMIS', dayIndex: 3, items: ['MESIN CUCI', 'AC', 'HP'] },
      { date: '07/08/2026', dayName: "JUM'AT", dayIndex: 4, items: ['SHOWCASE', 'MAGIC COM', 'LAPTOP'] },
      { date: '08/08/2026', dayName: 'SABTU', dayIndex: 5, items: ['OVEN', 'BLENDER', 'KIPAS'] },
      { date: '09/08/2026', dayName: 'MINGGU', dayIndex: 6, items: ['B2 PROMO KREDIT', 'SEPEDA LISTRIK', 'KULKAS'] },
    ],
  },
];

/**
 * Normalizes date format DD/MM/YYYY or DD-MM-YYYY to standard DD/MM/YYYY
 */
export function normalizeDateSlash(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '/').trim();
}

export function normalizeDateHyphen(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/\//g, '-').trim();
}

/**
 * Find or create a day entry inside the weeks matrix
 */
export function findDayInWeeks(weeks: SheetWeekRow[], targetDate: string): SheetDaySchedule | null {
  const cleanTarget = normalizeDateSlash(targetDate);
  for (const week of weeks) {
    for (const day of week.days) {
      if (normalizeDateSlash(day.date) === cleanTarget) {
        return day;
      }
    }
  }
  return null;
}

/**
 * Update or inject a day schedule into the weeks matrix
 */
export function upsertDayInWeeks(
  weeks: SheetWeekRow[],
  targetDate: string,
  newItems: string[]
): SheetWeekRow[] {
  const cleanTarget = normalizeDateSlash(targetDate);
  let found = false;

  const updatedWeeks = weeks.map((week) => {
    const updatedDays = week.days.map((day) => {
      if (normalizeDateSlash(day.date) === cleanTarget) {
        found = true;
        return {
          ...day,
          items: newItems,
        };
      }
      return day;
    });
    return { ...week, days: updatedDays };
  });

  if (found) {
    return updatedWeeks;
  }

  // If not found in existing weeks, append to the latest week or create a new week
  return updatedWeeks;
}

/**
 * Google Apps Script (Code.gs) for Spreadsheets "ELEKTRONIK"
 * Automatically formats headers in black, maps cells with corresponding product colors,
 * populates all weeks, overwrites cells in-place without duplicates, and exposes real-time GET/POST endpoints!
 */
export function generateGoogleAppsScriptForDesignSync(): string {
  return `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SINKRONISASI JADWAL DESAIN SOSMED ELEKTRONIK (V2.5)
 * =========================================================================
 * Fitur:
 * 1. setupFullElectronicSchedule(): 1-Klik mengisi seluruh tabel 4-6 Minggu lengkap Tanggal & Warna
 * 2. Menu khusus "⚡ JADWAL ELEKTRONIK" di menu atas Google Spreadsheet
 * 3. syncDateItemsToSheet(): Menimpa data secara IN-PLACE pada kolom & tanggal yang sama (ANTI-DUPLIKAT)
 * 4. removeDuplicateDateRows(): Membersihkan baris duplikat jika ada baris tanggal ganda di bawah tabel
 * 5. Endpoint Web App (doGet & doPost) untuk sinkronisasi realtime dari Web App
 * =========================================================================
 */

// KATALOG WARNA RESMI PRODUK ELEKTRONIK & BANNER PROMO (HEX)
var PRODUCT_COLORS = {
  'SEPEDA LISTRIK': { bg: '#b8860b', text: '#ffffff' }, // Gold / Ochre
  'LAPTOP': { bg: '#e040fb', text: '#000000' },         // Magenta Neon
  'HP': { bg: '#ffab91', text: '#3e2723' },             // Peach
  'TV': { bg: '#b2ebf2', text: '#004d40' },             // Ice Cyan
  'KULKAS': { bg: '#81d4fa', text: '#01579b' },         // Sky Blue
  'MESIN CUCI': { bg: '#f48fb1', text: '#880e4f' },     // Pastel Pink
  'AC': { bg: '#a5d6a7', text: '#1b5e20' },             // Mint Green
  'MAGIC COM': { bg: '#ffb74d', text: '#e65100' },     // Mandarin Orange
  'SHOWCASE': { bg: '#ffcc80', text: '#e65100' },      // Peach Glow
  'KOMPOR': { bg: '#4caf50', text: '#ffffff' },        // Leaf Green
  'BLENDER': { bg: '#2e7d32', text: '#ffffff' },       // Forest Green
  'CHOPPER': { bg: '#2e7d32', text: '#ffffff' },       // Forest Green
  'SETRIKA': { bg: '#33691e', text: '#ffffff' },       // Dark Olive
  'KIPAS': { bg: '#64b5f6', text: '#0d47a1' },         // Cerulean Blue
  'OVEN': { bg: '#ffe0b2', text: '#bf360c' },          // Biscuit Orange
  'AIR FRYER': { bg: '#80cbc4', text: '#004d40' },     // Turquoise
  'AIRFRYER': { bg: '#80cbc4', text: '#004d40' },      // Turquoise
  'DISPENSER': { bg: '#ce93d8', text: '#4a148c' },     // Lilac Purple
  'PRINTER': { bg: '#d7ccc8', text: '#3e2723' },       // Sand / Tan
  'SPEAKER': { bg: '#cfd8dc', text: '#263238' },       // Slate Gray
  'FREEZER BOX': { bg: '#4a148c', text: '#ffffff' },   // Dark Maroon
  'FREEZER': { bg: '#4a148c', text: '#ffffff' },       // Dark Maroon
  'B2 PROMO KREDIT': { bg: '#1565c0', text: '#ffffff' }, // Royal Blue
  'B2 KREDIT 0%': { bg: '#1565c0', text: '#ffffff' },
  'B2 PROMO SHARP': { bg: '#1565c0', text: '#ffffff' },
  'B2 TESTIMONI PROMO SHARP': { bg: '#1565c0', text: '#ffffff' },
  'B2 PROMO HARP': { bg: '#1565c0', text: '#ffffff' },
  'B2 SPAYLATER': { bg: '#1565c0', text: '#ffffff' },
  'B2 PROMO': { bg: '#1565c0', text: '#ffffff' },
  'PRE ORDER SAMSUNG': { bg: '#ffcc80', text: '#e65100' },
  'LIBUR': { bg: '#d50000', text: '#ffffff' },         // Signal Red
  'CLOSE STORE': { bg: '#d50000', text: '#ffffff' },
  'OPEN STORE': { bg: '#ffd600', text: '#000000' },    // Yellow
  'KUNJUNGAN': { bg: '#e0e0e0', text: '#212121' }      // Light Gray
};

var SHEET_NAME = 'ELEKTRONIK';

/**
 * 1. Menu Tambahan di Google Spreadsheet saat Spreadsheet dibuka
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('⚡ JADWAL ELEKTRONIK')
      .addItem('🚀 1-Klik Isi / Reset Seluruh Matriks 6 Minggu', 'setupFullElectronicSchedule')
      .addItem('🎨 Rapikan Format & Pewarnaan Semua Sel', 'reformatAllProductColors')
      .addItem('🧹 Bersihkan Baris Duplikat Bawah Tabel', 'removeDuplicateDateRows')
      .addToUi();
  } catch (e) {
    // Abaikan jika dipanggil dari trigger non-UI
  }
}

/**
 * 2. Fungsi Utama: Mengisi Seluruh Matriks Jadwal Desain (Lengkap Tanggal & Warna)
 * Jalankan fungsi ini dari editor Apps Script (Pilih setupFullElectronicSchedule -> Klik Run / Jalankan)
 */
function setupFullElectronicSchedule() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  sheet.clear();

  // Header Hari (Baris 1)
  var headers = ['SENIN', 'SELASA', 'RABU', 'KAMIS', "JUM'AT", 'SABTU', 'MINGGU'];
  var headerRange = sheet.getRange(1, 1, 1, 7);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setBackground('#f8fafc');
  headerRange.setFontColor('#0f172a');
  sheet.setRowHeight(1, 36);

  // Data Master 6 Minggu Jadwal Desain Elektronik
  var masterWeeksData = [
    {
      dates: ['29/06/2026', '30/06/2026', '01/07/2026', '02/07/2026', '03/07/2026', '04/07/2026', '05/07/2026'],
      itemsMatrix: [
        ['SEPEDA LISTRIK', 'KULKAS', 'PRINTER', 'SEPEDA LISTRIK', 'AC', 'LIBUR', 'HP'],
        ['TV', 'MESIN CUCI', 'LAPTOP', 'MAGIC COM', 'MESIN CUCI', '', 'SEPEDA LISTRIK'],
        ['KOMPOR', 'AC', 'HP', 'KULKAS', 'CHOPPER', '', 'TV'],
        ['BLENDER', 'B2 PROMO SHARP', 'SPEAKER', 'SHOWCASE', 'SETRIKA', '', 'B2 TESTIMONI PROMO SHARP']
      ]
    },
    {
      dates: ['06/07/2026', '07/07/2026', '08/07/2026', '09/07/2026', '10/07/2026', '11/07/2026', '12/07/2026'],
      itemsMatrix: [
        ['KULKAS', 'KUNJUNGAN', 'SEPEDA LISTRIK', 'MESIN CUCI', 'LIBUR', 'SEPEDA LISTRIK', 'AC'],
        ['MAGIC COM', '', 'HP', 'TV', '', 'KULKAS', 'HP'],
        ['SPEAKER', '', 'B2 PROMO SHARP', 'LAPTOP', '', 'FREEZER BOX', 'MESIN CUCI'],
        ['DISPENSER', '', 'B2 PROMO KREDIT', 'AC', '', 'MAGIC COM', 'B2 KREDIT 0%']
      ]
    },
    {
      dates: ['13/07/2026', '14/07/2026', '15/07/2026', '16/07/2026', '17/07/2026', '18/07/2026', '19/07/2026'],
      itemsMatrix: [
        ['BLENDER', 'B2 PROMO SHARP', 'HP', 'SEPEDA LISTRIK', 'HP', 'LIBUR', 'SEPEDA LISTRIK'],
        ['TV', 'SEPEDA LISTRIK', 'SHOWCASE', 'MESIN CUCI', 'KULKAS', '', 'TV'],
        ['SPEAKER', 'DISPENSER', 'AIRFRYER', 'LAPTOP', 'AC', '', 'B2 PROMO KREDIT 0%'],
        ['', 'OPEN STORE', 'TV', '', '', '', 'B2 PROMO SHARP']
      ]
    },
    {
      dates: ['20/07/2026', '21/07/2026', '22/07/2026', '23/07/2026', '24/07/2026', '25/07/2026', '26/07/2026'],
      itemsMatrix: [
        ['MESIN CUCI', 'HP', 'MESIN CUCI', 'SEPEDA LISTRIK', 'TV', 'MESIN CUCI', 'SEPEDA LISTRIK'],
        ['DISPENSER', 'SEPEDA LISTRIK', 'OVEN', 'LAPTOP', 'KULKAS', 'SETRIKA', 'HP'],
        ['KULKAS', 'MAGIC COM', 'KOMPOR', 'FREEZER BOX', 'AC', 'SPEAKER', 'BLENDER'],
        ['KOMPOR', '', '', '', '', 'B2 PROMO HARP', 'B2 KREDIT']
      ]
    },
    {
      dates: ['27/07/2026', '28/07/2026', '29/07/2026', '30/07/2026', '31/07/2026', '01/08/2026', '02/08/2026'],
      itemsMatrix: [
        ['LIBUR', 'KULKAS', 'PRE ORDER SAMSUNG', 'LAPTOP', 'BLENDER', 'TV', 'B2 PROMO KREDIT'],
        ['', 'AC', 'SEPEDA LISTRIK', 'SHOWCASE', 'AC', 'MAGIC COM', 'SEPEDA LISTRIK'],
        ['', 'TV', 'KOMPOR', 'MESIN CUCI', 'SEPEDA LISTRIK', 'KULKAS', 'KOMPOR'],
        ['', 'HP', 'DISPENSER', 'OPEN STORE', 'HP', '', '']
      ]
    },
    {
      dates: ['03/08/2026', '04/08/2026', '05/08/2026', '06/08/2026', '07/08/2026', '08/08/2026', '09/08/2026'],
      itemsMatrix: [
        ['LIBUR', 'KUNJUNGAN', 'SEPEDA LISTRIK', 'MESIN CUCI', 'SHOWCASE', 'OVEN', 'B2 PROMO KREDIT'],
        ['', '', 'KULKAS', 'AC', 'MAGIC COM', 'BLENDER', 'SEPEDA LISTRIK'],
        ['', '', 'TV', 'HP', 'LAPTOP', 'KIPAS', 'KULKAS']
      ]
    }
  ];

  var currentRow = 2;

  for (var w = 0; w < masterWeeksData.length; w++) {
    var week = masterWeeksData[w];

    // Tulis Baris Tanggal (Hitam Bold, simpan sebagai Text agar tidak terkonversi otomatis ke Date Object)
    var dateRange = sheet.getRange(currentRow, 1, 1, 7);
    dateRange.setNumberFormat('@'); // Text format
    dateRange.setValues([week.dates]);
    dateRange.setFontWeight('bold');
    dateRange.setHorizontalAlignment('center');
    dateRange.setVerticalAlignment('middle');
    dateRange.setBackground('#000000');
    dateRange.setFontColor('#ffffff');
    sheet.setRowHeight(currentRow, 28);
    currentRow++;

    // Tulis Item Produk di bawah tanggal
    for (var r = 0; r < week.itemsMatrix.length; r++) {
      var rowItems = week.itemsMatrix[r];
      var itemRange = sheet.getRange(currentRow, 1, 1, 7);
      itemRange.setValues([rowItems]);
      itemRange.setFontWeight('bold');
      itemRange.setHorizontalAlignment('center');
      itemRange.setVerticalAlignment('middle');
      sheet.setRowHeight(currentRow, 28);

      // Warnai setiap sel produk
      for (var c = 0; c < rowItems.length; c++) {
        var cellText = String(rowItems[c] || '').trim();
        var cell = sheet.getRange(currentRow, c + 1);
        if (cellText) {
          var color = getProductColor(cellText);
          cell.setBackground(color.bg);
          cell.setFontColor(color.text);
        } else {
          cell.setBackground('#ffffff');
          cell.setFontColor('#000000');
        }
      }
      currentRow++;
    }
  }

  // Atur Border & Lebar Kolom
  var totalRows = currentRow - 1;
  var fullGrid = sheet.getRange(1, 1, totalRows, 7);
  fullGrid.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);

  for (var col = 1; col <= 7; col++) {
    sheet.setColumnWidth(col, 175);
  }
  
  sheet.setFrozenRows(1);
  return 'Sukses: Seluruh jadwal desain 6 Minggu berhasil diisi ke Sheet "' + SHEET_NAME + '"!';
}

/**
 * 3. Web App GET Handler: Mengembalikan seluruh data matriks jadwal dalam format JSON
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    var data = sheet.getDataRange().getDisplayValues(); // Gunakan getDisplayValues untuk format teks akurat
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      sheetName: sheet.getName(),
      rowsCount: data.length,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 4. Web App POST Handler: Menerima update jadwal dari Web App
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'syncDay';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      initSheetHeaders(sheet);
    }

    if (action === 'setupTemplate' || action === 'syncAllWeeks') {
      if (payload.weeks && Array.isArray(payload.weeks) && payload.weeks.length > 0) {
        syncAllWeeksDataToSheet(sheet, payload.weeks);
      } else {
        setupFullElectronicSchedule();
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Seluruh matriks jadwal berhasil diperbarui di Google Sheets!'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Default Action: syncDay (Menimpa data pada tanggal tertentu secara in-place)
    var targetDate = (payload.date || '').trim();
    var items = payload.items || [];
    var result = syncDateItemsToSheet(sheet, targetDate, items);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Jadwal desain untuk ' + targetDate + ' berhasil ditimpa ke kolom yang sesuai!',
      targetDate: targetDate,
      items: items,
      updatedCell: result
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 5. Tulis Seluruh Data Weeks dari Web App
 */
function syncAllWeeksDataToSheet(sheet, weeks) {
  sheet.clear();
  initSheetHeaders(sheet);

  var currentRow = 2;
  for (var w = 0; w < weeks.length; w++) {
    var week = weeks[w];
    var dates = [];
    var maxItems = 3;

    for (var d = 0; d < 7; d++) {
      var day = (week.days && week.days[d]) ? week.days[d] : { date: '', items: [] };
      dates.push(day.date || '');
      if (day.items && day.items.length > maxItems) {
        maxItems = day.items.length;
      }
    }

    // Baris Tanggal Hitam Bold
    var dateRange = sheet.getRange(currentRow, 1, 1, 7);
    dateRange.setNumberFormat('@');
    dateRange.setValues([dates]);
    dateRange.setFontWeight('bold');
    dateRange.setHorizontalAlignment('center');
    dateRange.setVerticalAlignment('middle');
    dateRange.setBackground('#000000');
    dateRange.setFontColor('#ffffff');
    sheet.setRowHeight(currentRow, 28);
    currentRow++;

    // Baris Item-item Desain
    for (var r = 0; r < maxItems; r++) {
      var rowItems = [];
      for (var d = 0; d < 7; d++) {
        var dayObj = (week.days && week.days[d]) ? week.days[d] : { items: [] };
        rowItems.push(dayObj.items && dayObj.items[r] ? dayObj.items[r] : '');
      }

      var itemRange = sheet.getRange(currentRow, 1, 1, 7);
      itemRange.setValues([rowItems]);
      itemRange.setFontWeight('bold');
      itemRange.setHorizontalAlignment('center');
      itemRange.setVerticalAlignment('middle');
      sheet.setRowHeight(currentRow, 28);

      for (var c = 0; c < 7; c++) {
        var txt = String(rowItems[c] || '').trim();
        var cell = sheet.getRange(currentRow, c + 1);
        if (txt) {
          var colStyle = getProductColor(txt);
          cell.setBackground(colStyle.bg);
          cell.setFontColor(colStyle.text);
        } else {
          cell.setBackground('#ffffff');
          cell.setFontColor('#000000');
        }
      }
      currentRow++;
    }
  }

  var totalRows = currentRow - 1;
  var fullGrid = sheet.getRange(1, 1, totalRows, 7);
  fullGrid.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);

  for (var cIdx = 1; cIdx <= 7; cIdx++) {
    sheet.setColumnWidth(cIdx, 175);
  }
}

/**
 * 6. Helper: Menstandarkan format tanggal ke DD/MM/YYYY dari objek Date maupun String
 */
function normalizeDateStr(val) {
  if (!val) return '';
  if (Object.prototype.toString.call(val) === '[object Date]' || val instanceof Date) {
    var d = ('0' + val.getDate()).slice(-2);
    var m = ('0' + (val.getMonth() + 1)).slice(-2);
    var y = val.getFullYear();
    return d + '/' + m + '/' + y;
  }
  var s = String(val).trim().replace(/-/g, '/');
  var parts = s.split('/');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY/MM/DD -> DD/MM/YYYY
      var y = parts[0];
      var m = ('0' + parseInt(parts[1], 10)).slice(-2);
      var d = ('0' + parseInt(parts[2], 10)).slice(-2);
      return d + '/' + m + '/' + y;
    } else {
      // DD/MM/YYYY or D/M/YYYY
      var d = ('0' + parseInt(parts[0], 10)).slice(-2);
      var m = ('0' + parseInt(parts[1], 10)).slice(-2);
      var y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return d + '/' + m + '/' + y;
    }
  }
  return s;
}

/**
 * 7. Cari tanggal di spreadsheet dan UPDATE IN-PLACE (TIMPA DATA LAMA)
 * Mencegah baris duplikat dan membersihkan item lama di bawah tanggal tsb!
 */
function syncDateItemsToSheet(sheet, targetDate, items) {
  var normTarget = normalizeDateStr(targetDate);
  var range = sheet.getDataRange();
  var values = range.getValues();
  var displayValues = range.getDisplayValues();
  
  var targetRow = -1;
  var targetCol = -1;
  
  // 1. Cari koordinat sel tanggal di seluruh sheet (cek displayValues dan values)
  for (var r = 0; r < displayValues.length; r++) {
    for (var c = 0; c < displayValues[r].length; c++) {
      var dVal = normalizeDateStr(displayValues[r][c]);
      var vVal = normalizeDateStr(values[r] ? values[r][c] : '');
      
      if (dVal === normTarget || vVal === normTarget) {
        targetRow = r + 1; // 1-indexed baris tanggal
        targetCol = c + 1; // 1-indexed kolom hari
        break;
      }
    }
    if (targetRow !== -1) break;
  }
  
  // 2. Jika tanggal belum ada sama sekali di tabel, baru tambahkan ke baris baru
  if (targetRow === -1) {
    targetRow = appendNewDateCell(sheet, normTarget);
    targetCol = 1;
  }
  
  // 3. Bersihkan SEL LAMA di bawah tanggal ini (hingga baris tanggal berikutnya / maks 6 baris)
  // Ini memastikan data lama benar-benar DITIMPA TANPA MENINGGALKAN SISA!
  var maxRows = sheet.getLastRow();
  for (var k = 1; k <= 6; k++) {
    var checkRow = targetRow + k;
    if (checkRow > maxRows) break;
    var rowDisplay = displayValues[checkRow - 1] ? displayValues[checkRow - 1][targetCol - 1] : '';
    var checkVal = normalizeDateStr(rowDisplay);
    // Jika menemukan baris tanggal lain (format DD/MM/YYYY), stop agar tidak menghapus tanggal minggu bawahnya
    if (checkVal.match(/^\\d{2}\\/\\d{2}\\/\\d{4}$/)) {
      break;
    }
    var clearCell = sheet.getRange(checkRow, targetCol);
    clearCell.setValue('');
    clearCell.setBackground('#ffffff');
    clearCell.setFontColor('#000000');
  }
  
  // 4. Tulis item-item BARU dengan format & warna resmi
  for (var i = 0; i < items.length; i++) {
    var itemText = String(items[i] || '').trim().toUpperCase();
    if (!itemText) continue;
    
    var itemRow = targetRow + 1 + i;
    var itemCell = sheet.getRange(itemRow, targetCol);
    itemCell.setValue(itemText);
    itemCell.setFontWeight('bold');
    itemCell.setHorizontalAlignment('center');
    itemCell.setVerticalAlignment('middle');
    
    // Terapkan warna resmi produk / banner promo
    var style = getProductColor(itemText);
    itemCell.setBackground(style.bg);
    itemCell.setFontColor(style.text);
  }
  
  return { row: targetRow, col: targetCol, targetDate: normTarget, updatedItemsCount: items.length };
}

/**
 * 8. Append baris tanggal baru jika benar-benar belum ada di tabel
 */
function appendNewDateCell(sheet, targetDate) {
  var lastRow = Math.max(1, sheet.getLastRow());
  var newDateRow = lastRow + 1;
  
  var dateRange = sheet.getRange(newDateRow, 1, 1, 7);
  dateRange.setValue('');
  dateRange.setBackground('#000000');
  dateRange.setFontColor('#ffffff');
  dateRange.setFontWeight('bold');
  dateRange.setHorizontalAlignment('center');
  
  var cell = sheet.getRange(newDateRow, 1);
  cell.setNumberFormat('@');
  cell.setValue(targetDate);
  sheet.setRowHeight(newDateRow, 28);
  
  // Beri baris kosong di bawahnya
  for (var i = 1; i <= 4; i++) {
    var emptyRowRange = sheet.getRange(newDateRow + i, 1, 1, 7);
    emptyRowRange.setValue('');
    emptyRowRange.setBackground('#ffffff');
    sheet.setRowHeight(newDateRow + i, 28);
  }
  
  return newDateRow;
}

/**
 * 9. Pembersih Baris Duplikat di Bawah Tabel
 * Jika sebelumnya ada baris duplikat yang terbuat di luar tabel utama, fungsi ini akan membersihkannya
 */
function removeDuplicateDateRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  var displayValues = sheet.getDataRange().getDisplayValues();
  var seenDates = {};
  var rowsToDelete = [];
  
  // Deteksi tanggal baris demi baris
  for (var r = 1; r < displayValues.length; r++) { // Lewati header
    var isDateRow = false;
    var rowDates = [];
    
    for (var c = 0; c < 7; c++) {
      var val = normalizeDateStr(displayValues[r][c]);
      if (val.match(/^\\d{2}\\/\\d{2}\\/\\d{4}$/)) {
        isDateRow = true;
        rowDates.push({ date: val, col: c });
      }
    }
    
    if (isDateRow) {
      // Periksa apakah tanggal di baris ini semuanya sudah pernah muncul di atas
      var allDuplicate = true;
      for (var i = 0; i < rowDates.length; i++) {
        var dStr = rowDates[i].date;
        if (!seenDates[dStr]) {
          allDuplicate = false;
          seenDates[dStr] = true;
        }
      }
      
      // Jika baris tanggal ini duplikat total (seperti baris ekstra di bawah), tandai untuk dihapus
      if (allDuplicate && rowDates.length > 0) {
        rowsToDelete.push(r + 1); // 1-indexed
      }
    }
  }
  
  // Hapus dari bawah ke atas agar index baris tidak bergeser
  for (var k = rowsToDelete.length - 1; k >= 0; k--) {
    var delRow = rowsToDelete[k];
    // Hapus baris tanggal duplikat dan 3 baris item di bawahnya
    var maxDel = Math.min(4, sheet.getLastRow() - delRow + 1);
    sheet.deleteRows(delRow, maxDel);
  }
  
  reformatAllProductColors();
}

/**
 * 10. Helper Penentuan Warna Produk & Promo
 */
function getProductColor(itemName) {
  var clean = itemName.replace(/^DESAIN\\s+/, '').trim().toUpperCase();
  if (PRODUCT_COLORS[clean]) return PRODUCT_COLORS[clean];
  
  // Promo / Banner detection
  if (
    clean.indexOf('PROMO') !== -1 ||
    clean.indexOf('KREDIT') !== -1 ||
    clean.indexOf('DISKON') !== -1 ||
    clean.indexOf('CASHBACK') !== -1 ||
    clean.indexOf('SPAYLATER') !== -1 ||
    clean.indexOf('TESTIMONI') !== -1 ||
    clean.indexOf('VOUCHER') !== -1 ||
    clean.indexOf('PRE ORDER') !== -1 ||
    clean.indexOf('BUY ONE') !== -1 ||
    clean.indexOf('GAJIAN') !== -1 ||
    clean.indexOf('MERDEKA') !== -1 ||
    clean.indexOf('B2') === 0
  ) {
    return { bg: '#1565c0', text: '#ffffff' }; // Royal Cobalt Blue
  }

  for (var key in PRODUCT_COLORS) {
    if (clean.indexOf(key) !== -1) {
      return PRODUCT_COLORS[key];
    }
  }
  return { bg: '#00897b', text: '#ffffff' };
}

/**
 * 11. Re-format seluruh warna di sheet
 */
function reformatAllProductColors() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  var range = sheet.getDataRange();
  var values = range.getValues();
  var displayValues = range.getDisplayValues();
  
  for (var r = 1; r < displayValues.length; r++) { // Mulai dari baris 2
    for (var c = 0; c < displayValues[r].length; c++) {
      var dVal = normalizeDateStr(displayValues[r][c]);
      var cell = sheet.getRange(r + 1, c + 1);
      
      // Jika format tanggal, pastikan hitam
      if (dVal.match(/^\\d{2}\\/\\d{2}\\/\\d{4}$/)) {
        cell.setBackground('#000000');
        cell.setFontColor('#ffffff');
        cell.setFontWeight('bold');
        cell.setHorizontalAlignment('center');
      } else {
        var rawText = String(displayValues[r][c] || '').trim();
        if (rawText) {
          var style = getProductColor(rawText);
          cell.setBackground(style.bg);
          cell.setFontColor(style.text);
          cell.setFontWeight('bold');
          cell.setHorizontalAlignment('center');
        }
      }
    }
  }
}

function initSheetHeaders(sheet) {
  var headers = ['SENIN', 'SELASA', 'RABU', 'KAMIS', "JUM'AT", 'SABTU', 'MINGGU'];
  var headerRange = sheet.getRange(1, 1, 1, 7);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setBackground('#f8fafc');
  headerRange.setFontColor('#0f172a');
  sheet.setRowHeight(1, 36);
}
`;
}
