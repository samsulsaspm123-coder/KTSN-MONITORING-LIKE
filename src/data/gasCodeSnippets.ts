export const GAS_CODE_GS = `/**
 * =========================================================================
 * SISTEM MONITORING LIKE INSTAGRAM KARYAWAN RETAIL - GOOGLE APPS SCRIPT
 * =========================================================================
 * Deskripsi: Backend & Controller Google Apps Script untuk memeriksa like postingan
 *            Instagram karyawan retail, mengecualikan karyawan Cuti/Off/HP Hilang,
 *            dan menghasilkan format rekapitulasi denda WhatsApp per Divisi.
 *
 * Nama Sheet Target: 'Daftar Karyawan'
 * Struktur Kolom:
 *   A: Divisi
 *   B: Nama Karyawan
 *   C: Username 1
 *   D: Username 2
 *   E: Status (Normal / Cuti / Off / Izin / Sakit / HP Hilang)
 *   F: Keterangan (Opsional)
 * =========================================================================
 */

// KONFIGURASI NAMA SHEET & KODE TOKO
var SHEET_NAME = 'Daftar Karyawan';
var DEFAULT_STORE_CODE = 'KTSN';

/**
 * 1. Melayani Tampilan Web App (Frontend HTML)
 */
function doGet(e) {
  // Jika ada parameter JSON API query
  if (e && e.parameter && e.parameter.action === 'getEmployees') {
    var data = getEmployeesData();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Tampilkan antarmuka Web App HTML
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Sistem Monitoring Like Instagram Karyawan - ' + DEFAULT_STORE_CODE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 2. Menerima request POST API dari luar jika diperlukan
 */
function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action || 'process';

    if (action === 'process') {
      var result = processLikersBackend(contents.urlPost, contents.rawLikers, contents.storeCode);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'getEmployees') {
      var emps = getEmployeesData();
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: emps }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. Mengambil Data Karyawan dari Google Sheets
 */
function getEmployeesData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      // Jika sheet belum ada, inisialisasi otomatis
      sheet = setupInitialSheetTemplate();
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }

    var values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    var employees = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var divisi = String(row[0] || '').trim();
      var nama = String(row[1] || '').trim();
      var username1 = String(row[2] || '').trim();
      var username2 = String(row[3] || '').trim();
      var status = String(row[4] || 'Normal').trim();
      var keterangan = String(row[5] || '').trim();

      // Lewati baris kosong
      if (!nama && !username1) continue;

      employees.push({
        id: 'EMP-' + (i + 1),
        divisi: divisi || 'UMUM',
        nama: nama,
        username1: username1,
        username2: username2,
        status: status || 'Normal',
        keterangan: keterangan
      });
    }

    return employees;
  } catch (error) {
    Logger.log('Error getEmployeesData: ' + error);
    throw new Error('Gagal membaca data dari Sheet "' + SHEET_NAME + '": ' + error.message);
  }
}

/**
 * 4. Helper Normalisasi Username IG
 */
function normalizeUsername(u) {
  if (!u) return '';
  return String(u)
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[\\s\\r\\n\\t]+/g, '')
    .replace(/[^\\w._]/g, '');
}

/**
 * 5. Helper Ekstraksi Username dari Teks Mentah (Paste / Console)
 */
function extractUsernames(rawText) {
  if (!rawText || !rawText.trim()) return [];

  var text = rawText.trim();
  var likersSet = {};

  var ignoredWords = {
    'follow': 1, 'following': 1, 'ikuti': 1, 'mengikuti': 1, 'hapus': 1,
    'verified': 1, 'likes': 1, 'suka': 1, 'search': 1, 'cari': 1,
    'instagram': 1, 'loading': 1, 'profile': 1, 'profil': 1, 'message': 1,
    'http': 1, 'https': 1, 'www': 1, 'com': 1
  };

  var lines = text.split(/[\\r\\n,;\\t]+/);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var tokens = line.split(/\\s+/);
    for (var j = 0; j < tokens.length; j++) {
      var clean = normalizeUsername(tokens[j]);
      if (clean && clean.length >= 2 && !ignoredWords[clean]) {
        likersSet[clean] = true;
      }
    }
  }

  return Object.keys(likersSet);
}

/**
 * 6. Format Tanggal Hari Ini (DD/MM/YYYY)
 */
function getTodayDateIndo() {
  var now = new Date();
  var dd = String(now.getDate());
  var mm = String(now.getMonth() + 1);
  var yyyy = now.getFullYear();

  if (dd.length < 2) dd = '0' + dd;
  if (mm.length < 2) mm = '0' + mm;

  return dd + '/' + mm + '/' + yyyy;
}

/**
 * 7. Pemrosesan Logika Denda & Generasi Format WA (Dipanggil Frontend via google.script.run)
 */
function processLikersBackend(urlPost, rawLikers, customStoreCode) {
  var storeCode = customStoreCode || DEFAULT_STORE_CODE;
  var employees = getEmployeesData();
  var extractedLikers = extractUsernames(rawLikers);
  var dateStr = getTodayDateIndo();

  var likerLookup = {};
  for (var i = 0; i < extractedLikers.length; i++) {
    likerLookup[extractedLikers[i]] = true;
  }

  // Pengelompokan Karyawan Denda per Divisi
  var divisionPenalties = {};
  var divisionOrder = [];
  var totalKaryawan = employees.length;
  var totalWajibLike = 0;
  var totalSudahLike = 0;
  var totalDenda = 0;
  var totalExempt = 0;

  var detailedResults = [];

  for (var k = 0; k < employees.length; k++) {
    var emp = employees[k];
    var u1 = normalizeUsername(emp.username1);
    var u2 = normalizeUsername(emp.username2);

    var hasLiked = (u1 && likerLookup[u1]) || (u2 && likerLookup[u2]);
    var isNormal = (emp.status.toLowerCase() === 'normal');

    var isExempt = !isNormal;
    var isDenda = isNormal && !hasLiked;

    if (isNormal) {
      totalWajibLike++;
      if (hasLiked) totalSudahLike++;
      if (isDenda) totalDenda++;
    } else {
      totalExempt++;
    }

    var divName = (emp.divisi || 'UMUM').toUpperCase();

    if (!divisionPenalties[divName]) {
      divisionPenalties[divName] = [];
      divisionOrder.push(divName);
    }

    if (isDenda) {
      divisionPenalties[divName].push(emp.nama);
    }

    detailedResults.push({
      nama: emp.nama,
      divisi: divName,
      username1: emp.username1,
      username2: emp.username2,
      status: emp.status,
      hasLiked: hasLiked,
      isDenda: isDenda,
      isExempt: isExempt
    });
  }

  // Susun Format Teks WhatsApp sesuai permintaan:
  // DATA LIKE [DD/MM/YYYY Hari Ini] KTSN
  // [URL Postingan]
  //
  // #[NAMA DIVISI]
  //  • [NAMA KARYAWAN 1]
  //  • [NAMA KARYAWAN 2]
  var waLines = [];
  waLines.push('DATA LIKE ' + dateStr + ' ' + storeCode);
  waLines.push((urlPost || '').trim() || 'https://www.instagram.com/p/...');
  waLines.push('');

  var hasAnyDenda = false;
  divisionOrder.sort(); // Urutkan nama divisi A-Z

  for (var d = 0; d < divisionOrder.length; d++) {
    var dName = divisionOrder[d];
    var names = divisionPenalties[dName];

    if (names && names.length > 0) {
      hasAnyDenda = true;
      waLines.push('#' + dName);
      for (var n = 0; n < names.length; n++) {
        waLines.push(' • ' + names[n]);
      }
      waLines.push(''); // Baris kosong pemisah divisi
    }
  }

  if (!hasAnyDenda) {
    waLines.push('LIKE DONE');
  }

  var finalWaText = waLines.join('\\n').trim();

  return {
    dateStr: dateStr,
    urlPost: urlPost,
    storeCode: storeCode,
    totalLikersInput: extractedLikers.length,
    totalKaryawan: totalKaryawan,
    totalWajibLike: totalWajibLike,
    totalSudahLike: totalSudahLike,
    totalDenda: totalDenda,
    totalExempt: totalExempt,
    waText: finalWaText,
    details: detailedResults
  };
}

/**
 * 8. Inisialisasi Template Sheet Otomatis jika sheet belum dibuat
 */
function setupInitialSheetTemplate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clear();

  // Header
  var headers = [['Divisi', 'Nama Karyawan', 'Username 1', 'Username 2', 'Status', 'Keterangan']];
  sheet.getRange(1, 1, 1, 6).setValues(headers)
    .setFontWeight('bold')
    .setBackground('#1E293B')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');

  // Contoh Data Awal Karyawan Retail
  var sampleData = [
    ['KASIR', 'Siti Rahmawati', 'siti_rahma99', 'sitirahma.real', 'Normal', 'Shift Pagi'],
    ['KASIR', 'Dewi Lestari', 'dewilestari_retail', 'dewi_les21', 'Normal', 'Shift Siang'],
    ['KASIR', 'Nurul Hidayah', 'nurul_hidayaah', '', 'Cuti', 'Cuti Tahunan'],
    ['PRAMUNIAGA', 'Ahmad Fauzi', 'fauzi_ahmad98', 'ahmadfauzi_id', 'Normal', 'Area Pria'],
    ['PRAMUNIAGA', 'Budi Santoso', 'budi_santoso_retail', 'budisantoso92', 'Normal', 'Area Wanita'],
    ['PRAMUNIAGA', 'Rina Marlina', 'rina_marlinaa', '', 'Off', 'Libur Rutin'],
    ['GUDANG', 'Eko Prasetyo', 'eko_prasetyo_gdg', 'ekopras22', 'Normal', 'Staff Inbound'],
    ['GUDANG', 'Hendra Gunawan', 'hendra_gunawan_real', '', 'HP Hilang', 'HP dalam perbaikan'],
    ['VISUAL MERCHANDISING', 'Nabila Syakira', 'nabila_syakira_vm', '', 'Normal', 'Display Store'],
    ['SUPERVISOR', 'Bambang Wijaya', 'bambang_spv_ktsn', '', 'Normal', 'Store SPV']
  ];

  sheet.getRange(2, 1, sampleData.length, 6).setValues(sampleData);

  // Dropdown Validasi untuk Kolom Status (Kolom E)
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Normal', 'Cuti', 'Off', 'Izin', 'Sakit', 'HP Hilang'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('E2:E100').setDataValidation(rule);

  // Auto-resize kolom
  sheet.autoResizeColumns(1, 6);
  sheet.setFrozenRows(1);

  return sheet;
}
`;

export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem Monitoring Like IG Karyawan - KTSN</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">

  <!-- Top Navigation -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-base font-bold text-slate-900 leading-tight">Monitoring Like Instagram Karyawan</h1>
          <p class="text-xs text-slate-500 font-medium">KTSN Retail Store System &bull; Auto Rekap WA & Denda</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          Google Sheets Terhubung
        </span>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-6xl mx-auto px-4 py-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Left Column: Input Form (5 cols) -->
      <div class="lg:col-span-6 space-y-5">
        
        <!-- Card 1: Input Data -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
              Input Postingan & Likers Instagram
            </h2>
            <span class="text-xs text-slate-400 font-medium" id="todayBadge">Hari Ini</span>
          </div>

          <!-- URL Postingan -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5" for="urlPost">
              URL Postingan Instagram <span class="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              id="urlPost" 
              placeholder="https://www.instagram.com/p/C_sample123/" 
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
            />
            <p class="text-[11px] text-slate-400 mt-1">Contoh: https://www.instagram.com/p/DAxKj2-z9Yw/</p>
          </div>

          <!-- Kode Toko / Cabang -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5" for="storeCode">
                Kode Toko / Unit
              </label>
              <input 
                type="text" 
                id="storeCode" 
                value="KTSN" 
                class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5" for="customDate">
                Tanggal Data
              </label>
              <input 
                type="text" 
                id="customDate" 
                readonly
                class="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <!-- Textarea Likers -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-semibold text-slate-700" for="rawLikers">
                Daftar Likers Instagram (Paste Console / Export) <span class="text-rose-500">*</span>
              </label>
              <button 
                type="button" 
                onclick="fillSampleLikers()" 
                class="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
              >
                + Isi Contoh Data
              </button>
            </div>
            <textarea 
              id="rawLikers" 
              rows="7" 
              placeholder="Paste deretan username likers di sini...&#10;Contoh format:&#10;siti_rahma99&#10;dewilestari_retail&#10;fauzi_ahmad98&#10;user_pelanggan1, user_pelanggan2" 
              class="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 custom-scrollbar"
            ></textarea>
            <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Mendukung: Baris baru, koma, spasi, atau hasil copy modal IG</span>
              <button type="button" onclick="clearLikers()" class="hover:text-rose-600 transition-colors">Bersihkan</button>
            </div>
          </div>

          <!-- Tombol Proses -->
          <button 
            id="btnProcess" 
            onclick="handleProcessLikers()" 
            class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
          >
            <svg id="iconSearch" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            <svg id="spinner" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white hidden" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span id="btnText">Proses & Generasi Rekap WA</span>
          </button>
        </div>

        <!-- Tips Instagram Extractor Console -->
        <div class="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 space-y-2">
          <div class="font-bold text-indigo-950 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Tips Cara Cepat Ambil Likers di Instagram Web
          </div>
          <p class="text-indigo-800 leading-relaxed">
            Buka postingan di Instagram Web &gt; Klik jumlah "Suka" / "Likes" agar popup likers muncul &gt; Buka <strong>Inspect / F12 &gt; Console</strong> &gt; Paste kode helper berikut lalu tekan Enter untuk otomatis menyalin semua likers ke clipboard:
          </p>
          <div class="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] relative overflow-x-auto">
            <code>(async()=>{let d=document.querySelector('div[role="dialog"] div[style*="overflow"]')||document.querySelector('div[role="dialog"]'),u=new Set(),lh=0,uc=0;while(uc<5){Array.from(document.querySelectorAll('div[role="dialog"] a')).map(a=>a.getAttribute('href')).filter(h=>h&&h.startsWith('/')&&!h.includes('/explore/')&&!h.includes('/direct/')).map(h=>h.replaceAll('/','')).forEach(x=>u.add(x));d.scrollTop+=500;await new Promise(r=>setTimeout(r,800));let nh=d.scrollTop;if(nh===lh){uc++}else{uc=0;lh=nh}}let res=Array.from(u).join('\n');console.log(res);copy(res);alert('✅ Sukses menyalin '+u.size+' username likers!');})();</code>
          </div>
        </div>

      </div>

      <!-- Right Column: Output Box & Summary (6 cols) -->
      <div class="lg:col-span-6 space-y-5">
        
        <!-- Output Card -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">2</span>
              Hasil Teks Rekapitulasi Denda WhatsApp
            </h2>
            <span id="badgeStatus" class="hidden px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
              Siap Kirim
            </span>
          </div>

          <!-- Summary Metric Badges -->
          <div id="metricsBox" class="grid grid-cols-4 gap-2 text-center">
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span class="text-[10px] text-slate-500 font-semibold block uppercase">Total Karyawan</span>
              <span class="text-base font-bold text-slate-900" id="mTotal">-</span>
            </div>
            <div class="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <span class="text-[10px] text-emerald-700 font-semibold block uppercase">Sudah Like</span>
              <span class="text-base font-bold text-emerald-800" id="mSudah">-</span>
            </div>
            <div class="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              <span class="text-[10px] text-rose-700 font-semibold block uppercase">Kena Denda</span>
              <span class="text-base font-bold text-rose-800" id="mDenda">-</span>
            </div>
            <div class="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <span class="text-[10px] text-amber-700 font-semibold block uppercase">Cuti / Off</span>
              <span class="text-base font-bold text-amber-800" id="mExempt">-</span>
            </div>
          </div>

          <!-- Textarea Output -->
          <div>
            <textarea 
              id="outputWa" 
              rows="10" 
              readonly
              placeholder="Hasil format WhatsApp akan muncul di sini setelah Anda menekan tombol 'Proses & Generasi Rekap WA'..."
              class="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl focus:outline-none custom-scrollbar select-all"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button 
              id="btnCopy"
              onclick="copyToClipboard()"
              class="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              <span id="copyBtnText">Salin Teks (Copy)</span>
            </button>

            <button 
              id="btnWa"
              onclick="openWhatsApp()"
              class="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>Buka di WhatsApp</span>
            </button>
          </div>

        </div>

        <!-- Detail Breakdown Accordion -->
        <div id="detailSection" class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 hidden">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Detail Per Divisi & Karyawan</h3>
            <span class="text-xs text-slate-400" id="detailCount">-</span>
          </div>
          <div id="divisionList" class="space-y-3 text-xs"></div>
        </div>

      </div>

    </div>
  </main>

  <!-- Script Logic -->
  <script>
    // Format tanggal hari ini
    function setDateToday() {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const formatted = dd + '/' + mm + '/' + yyyy;
      document.getElementById('customDate').value = formatted;
      document.getElementById('todayBadge').innerText = formatted;
    }
    setDateToday();

    // Contoh data likers
    function fillSampleLikers() {
      const sample = [
        "siti_rahma99",
        "dewilestari_retail",
        "putri.anggr",
        "fauzi_ahmad98",
        "dimas_prasetyo01",
        "nabila_syakira_vm",
        "bambang_spv_ktsn",
        "customer_fashion1",
        "buyer_retail_jogja",
        "ootd_indonesia"
      ].join('\\n');

      document.getElementById('urlPost').value = "https://www.instagram.com/p/DAxKj2-z9Yw/";
      document.getElementById('rawLikers').value = sample;
    }

    function clearLikers() {
      document.getElementById('rawLikers').value = "";
      document.getElementById('outputWa').value = "";
    }

    // Proses Like
    function handleProcessLikers() {
      const urlPost = document.getElementById('urlPost').value.trim();
      const rawLikers = document.getElementById('rawLikers').value.trim();
      const storeCode = document.getElementById('storeCode').value.trim() || 'KTSN';

      if (!rawLikers) {
        alert('Mohon masukkan daftar username likers terlebih dahulu!');
        document.getElementById('rawLikers').focus();
        return;
      }

      setLoading(true);

      // Jalankan via Google Apps Script backend jika tersedia di runtime GAS
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(onProcessSuccess)
          .withFailureHandler(onProcessError)
          .processLikersBackend(urlPost, rawLikers, storeCode);
      } else {
        // Fallback Simulasi jika dibuka di browser biasa / testing lokal
        setTimeout(function() {
          alert('Berjalan dalam mode mandiri.');
          setLoading(false);
        }, 500);
      }
    }

    function setLoading(isLoading) {
      const btn = document.getElementById('btnProcess');
      const spinner = document.getElementById('spinner');
      const iconSearch = document.getElementById('iconSearch');
      const btnText = document.getElementById('btnText');

      if (isLoading) {
        btn.disabled = true;
        btn.classList.add('opacity-75', 'cursor-not-allowed');
        spinner.classList.remove('hidden');
        iconSearch.classList.add('hidden');
        btnText.innerText = 'Memproses Data...';
      } else {
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
        spinner.classList.add('hidden');
        iconSearch.classList.remove('hidden');
        btnText.innerText = 'Proses & Generasi Rekap WA';
      }
    }

    function onProcessSuccess(result) {
      setLoading(false);
      document.getElementById('outputWa').value = result.waText;
      document.getElementById('badgeStatus').classList.remove('hidden');

      // Update metrics
      document.getElementById('mTotal').innerText = result.totalKaryawan;
      document.getElementById('mSudah').innerText = result.totalSudahLike;
      document.getElementById('mDenda').innerText = result.totalDenda;
      document.getElementById('mExempt').innerText = result.totalExempt;

      // Render detail
      renderDetails(result.details);
    }

    function onProcessError(err) {
      setLoading(false);
      alert('Terjadi kesalahan: ' + (err.message || err));
    }

    function renderDetails(details) {
      const container = document.getElementById('divisionList');
      const section = document.getElementById('detailSection');
      if (!details || details.length === 0) {
        section.classList.add('hidden');
        return;
      }
      section.classList.remove('hidden');
      document.getElementById('detailCount').innerText = details.length + ' Karyawan Terdaftar';

      let html = '<div class="divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar pr-1">';
      details.forEach(function(item) {
        let badge = '';
        if (item.isExempt) {
          badge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">' + item.status + '</span>';
        } else if (item.hasLiked) {
          badge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">✅ Sudah Like</span>';
        } else {
          badge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800">❌ DENDA</span>';
        }

        html += '<div class="py-2 flex items-center justify-between text-xs">' +
                  '<div>' +
                    '<span class="font-bold text-slate-800">' + item.nama + '</span>' +
                    '<span class="text-slate-400 text-[11px] ml-2">[' + item.divisi + '] @' + item.username1 + '</span>' +
                  '</div>' +
                  '<div>' + badge + '</div>' +
                '</div>';
      });
      html += '</div>';
      container.innerHTML = html;
    }

    function copyToClipboard() {
      const text = document.getElementById('outputWa').value;
      if (!text) {
        alert('Belum ada teks rekapitulasi untuk disalin!');
        return;
      }
      navigator.clipboard.writeText(text).then(function() {
        const btnText = document.getElementById('copyBtnText');
        btnText.innerText = '✅ Tersalin!';
        setTimeout(function() {
          btnText.innerText = 'Salin Teks (Copy)';
        }, 2000);
      });
    }

    function openWhatsApp() {
      const text = document.getElementById('outputWa').value;
      if (!text) {
        alert('Silakan proses data terlebih dahulu!');
        return;
      }
      const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text);
      window.open(url, '_blank');
    }
  </script>
</body>
</html>
`;

export const INSTAGRAM_CONSOLE_SCRIPT = `(async () => {
    const dialog = document.querySelector('div[role="dialog"]') || document.querySelector('div[aria-modal="true"]');
    if (!dialog) {
        alert("⚠️ Popup daftar Likes belum terbuka! Silakan klik jumlah Likes/Suka pada postingan Instagram dulu.");
        return;
    }
    
    // Temukan scrollable container di dalam modal
    let scrollContainer = dialog;
    const allDivs = dialog.querySelectorAll('div, section, ul');
    for (let i = 0; i < allDivs.length; i++) {
        const el = allDivs[i];
        const style = window.getComputedStyle(el);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
            scrollContainer = el;
            break;
        }
    }

    const reservedWords = {
        'p':1,'reel':1,'reels':1,'stories':1,'explore':1,'direct':1,'accounts':1,'about':1,
        'legal':1,'privacy':1,'terms':1,'help':1,'settings':1,'profile':1,'home':1,
        'instagram':1,'following':1,'followers':1,'likes':1,'suka':1,'ikuti':1,'mengikuti':1
    };
    
    const allUsernames = new Set();
    let lastHeight = 0;
    let unchangedCount = 0;

    console.log("🚀 Sedang mengumpulkan username likers, mohon tunggu sebentar...");

    for (let step = 0; step < 45; step++) {
        // Ambil dari link <a href="/username/">
        const links = document.querySelectorAll('div[role="dialog"] a, div[aria-modal="true"] a');
        links.forEach(a => {
            const h = a.getAttribute('href');
            if (h && typeof h === 'string') {
                const clean = h.replace(/https?:\\/\\/[^\\/]+/i, '').replace(/\\?.*$/, '').replace(/^\\/+/, '').replace(/\\/+$/, '').trim();
                if (clean && !clean.includes('/') && clean.length >= 2 && clean.length <= 32 && !reservedWords[clean.toLowerCase()]) {
                    allUsernames.add(clean.toLowerCase());
                }
            }
        });

        // Ambil juga dari span username
        const spans = document.querySelectorAll('div[role="dialog"] span, div[aria-modal="true"] span');
        spans.forEach(s => {
            const txt = (s.innerText || '').trim();
            if (/^[a-zA-Z0-9._]{3,30}$/.test(txt) && !reservedWords[txt.toLowerCase()]) {
                allUsernames.add(txt.toLowerCase());
            }
        });

        // Scroll ke bawah
        scrollContainer.scrollTop += 750;
        await new Promise(r => setTimeout(r, 650));

        const newHeight = scrollContainer.scrollTop;
        if (newHeight === lastHeight) {
            unchangedCount++;
            if (unchangedCount >= 4) break;
        } else {
            unchangedCount = 0;
            lastHeight = newHeight;
        }
    }

    console.log(\`✅ SELESAI! Ditemukan total \${allUsernames.size} username likers:\\n\`);
    const output = Array.from(allUsernames).join('\\n');
    console.log(output);

    // Otomatis salin ke Clipboard
    let copied = false;
    if (typeof copy === 'function') {
        copy(output);
        copied = true;
    }
    if (!copied) {
        try {
            const ta = document.createElement('textarea');
            ta.value = output;
            ta.style.position = 'fixed';
            ta.style.top = '-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            copied = true;
        } catch(e) {}
    }

    alert(\`✅ BERHASIL! \${allUsernames.size} username likers telah tersalin ke Clipboard!\\nSilakan buka Web App Monitoring dan tekan Ctrl+V (Paste).\`);
})();`;


export const SHEETS_TEMPLATE_STRUCTURE = [
  { column: 'A', header: 'Divisi', sample: 'KASIR', description: 'Nama Departemen/Divisi (contoh: KASIR, PRAMUNIAGA, GUDANG, VM, SPV)' },
  { column: 'B', header: 'Nama Karyawan', sample: 'Siti Rahmawati', description: 'Nama lengkap karyawan retail yang akan dimunculkan di rekap WhatsApp' },
  { column: 'C', header: 'Username 1', sample: 'siti_rahma99', description: 'Username akun Instagram utama karyawan (tanpa spasi/simbol)' },
  { column: 'D', header: 'Username 2', sample: 'sitirahma.real', description: 'Username akun IG kedua/cadangan karyawan (opsional)' },
  { column: 'E', header: 'Status', sample: 'Normal', description: 'Status kehadiran: Normal, Cuti, Off, Izin, Sakit, HP Hilang (Non-Normal diabaikan dari denda)' },
  { column: 'F', header: 'Keterangan', sample: 'Shift Pagi', description: 'Catatan tambahan seperti jadwal shift, tanggal cuti, dll (opsional)' },
];
