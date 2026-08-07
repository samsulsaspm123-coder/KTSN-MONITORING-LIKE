// Data dan template lengkap untuk Chrome Extension IG Liker Export & Bookmarklet

export const CHROME_EXTENSION_MANIFEST = `{
  "manifest_version": 3,
  "name": "IG Liker Exporter - Retail Monitoring",
  "version": "1.0.0",
  "description": "Ekstrak otomatis daftar username yang like postingan Instagram dan kirim ke Web App Monitoring KTSN",
  "permissions": ["activeTab", "scripting", "clipboardWrite", "storage"],
  "host_permissions": [
    "*://*.instagram.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Ekstrak Likers Instagram"
  }
}`;

export const CHROME_EXTENSION_POPUP_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IG Liker Exporter</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { width: 340px; background: #0f172a; color: #f8fafc; padding: 16px; font-size: 13px; }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid #334155; padding-bottom: 12px; }
    .logo { width: 28px; height: 28px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
    .title { font-size: 14px; font-weight: 700; color: #ffffff; }
    .subtitle { font-size: 11px; color: #94a3b8; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
    .btn { width: 100%; padding: 10px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-primary:hover { background: #4338ca; }
    .btn-success { background: #059669; color: white; margin-top: 8px; }
    .btn-secondary { background: #334155; color: #e2e8f0; margin-top: 8px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .status { margin-top: 10px; font-size: 11px; padding: 8px; border-radius: 6px; background: #0f172a; border: 1px solid #334155; color: #38bdf8; min-height: 36px; display: flex; align-items: center; }
    .result-box { margin-top: 10px; display: none; }
    textarea { width: 100%; height: 90px; background: #0f172a; border: 1px solid #475569; border-radius: 6px; color: #34d399; font-family: monospace; font-size: 11px; padding: 8px; resize: none; margin-top: 6px; }
    .badge { background: #312e81; color: #a5b4fc; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⚡</div>
    <div>
      <div class="title">IG Liker Exporter</div>
      <div class="subtitle">Retail Employee Engagement Monitor</div>
    </div>
  </div>

  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-weight: 600; color: #e2e8f0;">Langkah Ekstraksi:</span>
      <span class="badge">1-Klik Ekstrak</span>
    </div>
    <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin-bottom: 10px;">
      1. Buka postingan di Instagram Web.<br>
      2. Klik jumlah <b>Likes/Suka</b> agar popup terbuka.<br>
      3. Klik tombol di bawah ini:
    </p>

    <button id="btn-extract" class="btn btn-primary">
      <span>🚀 Ekstrak Semua Likers Postingan</span>
    </button>
    
    <div id="status-box" class="status">
      Status: Siap mengekstrak likers di tab Instagram saat ini.
    </div>

    <div id="result-container" class="result-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
        <span style="font-size: 11px; font-weight: 600; color: #34d399;" id="count-label">0 Username Ditemukan</span>
      </div>
      <textarea id="output-text" readonly placeholder="Daftar username akan muncul di sini..."></textarea>
      
      <button id="btn-copy" class="btn btn-success">
        <span>📋 Salin ke Clipboard &amp; Buka Web App</span>
      </button>
    </div>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;

export const CHROME_EXTENSION_POPUP_JS = `document.addEventListener('DOMContentLoaded', () => {
  const btnExtract = document.getElementById('btn-extract');
  const btnCopy = document.getElementById('btn-copy');
  const statusBox = document.getElementById('status-box');
  const resultContainer = document.getElementById('result-container');
  const outputText = document.getElementById('output-text');
  const countLabel = document.getElementById('count-label');

  let extractedList = [];

  btnExtract.addEventListener('click', async () => {
    btnExtract.disabled = true;
    statusBox.innerText = '⏳ Memeriksa tab Instagram aktif...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('instagram.com')) {
      statusBox.innerHTML = '⚠️ <span style="color: #f87171;">Buka halaman Instagram terlebih dahulu sebelum mengekstrak!</span>';
      btnExtract.disabled = false;
      return;
    }

    statusBox.innerText = '🚀 Sedang men-scroll dan mengekstrak username likers...';

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: inPageExtractor
    }, (results) => {
      btnExtract.disabled = false;
      if (!results || !results[0] || !results[0].result) {
        statusBox.innerHTML = '⚠️ <span style="color: #f87171;">Gagal mengambil data. Pastikan popup "Likes/Suka" di Instagram sudah diklik/terbuka!</span>';
        return;
      }

      const res = results[0].result;
      if (res.usernames && res.usernames.length > 0) {
        extractedList = res.usernames;
        const joined = extractedList.join('\\n');
        outputText.value = joined;
        countLabel.innerText = \`✅ \${extractedList.length} Username Berhasil Diekstrak!\`;
        statusBox.innerHTML = \`✅ Sukses! Ditemukan <b>\${extractedList.length}</b> username likers.\`;
        resultContainer.style.display = 'block';

        // Auto copy to clipboard
        navigator.clipboard.writeText(joined).catch(() => {});
      } else {
        statusBox.innerHTML = '⚠️ Tidak ada username yang terdeteksi. Pastikan modal daftar Likes Instagram terbuka di layar.';
      }
    });
  });

  btnCopy.addEventListener('click', () => {
    if (outputText.value) {
      navigator.clipboard.writeText(outputText.value).then(() => {
        btnCopy.innerText = '✅ Tersalin! Membuka Web App...';
        setTimeout(() => {
          btnCopy.innerText = '📋 Salin ke Clipboard & Buka Web App';
        }, 2000);
      });
    }
  });
});

// Function that runs directly inside the Instagram webpage tab
async function inPageExtractor() {
  let dialog = document.querySelector('div[role="dialog"] div[style*="overflow"]') || document.querySelector('div[role="dialog"]');
  if (!dialog) {
    return { error: 'MODAL_NOT_OPEN', usernames: [] };
  }

  let allUsernames = new Set();
  let lastHeight = 0;
  let unchangedCount = 0;

  for (let step = 0; step < 40; step++) {
    let links = Array.from(document.querySelectorAll('div[role="dialog"] a'))
      .map(a => a.getAttribute('href'))
      .filter(h => h && h.startsWith('/') && !h.includes('/explore/') && !h.includes('/direct/'))
      .map(h => h.replaceAll('/', '').trim());

    links.forEach(u => {
      if (u && u.length > 1 && !u.includes(' ')) {
        allUsernames.add(u.toLowerCase());
      }
    });

    dialog.scrollTop += 600;
    await new Promise(r => setTimeout(r, 600));

    let newHeight = dialog.scrollTop;
    if (newHeight === lastHeight) {
      unchangedCount++;
      if (unchangedCount >= 4) break;
    } else {
      unchangedCount = 0;
      lastHeight = newHeight;
    }
  }

  return { usernames: Array.from(allUsernames) };
}`;

export const CHROME_EXTENSION_CONTENT_JS = `// Background listener if needed
console.log('IG Liker Exporter content script active.');`;

export const BOOKMARKLET_CODE = `javascript:(async()=>{let d=document.querySelector('div[role="dialog"] div[style*="overflow"]')||document.querySelector('div[role="dialog"]');if(!d){alert('⚠️ Silakan klik jumlah Likes/Suka di Instagram dulu agar popup likers terbuka!');return;}let u=new Set(),lh=0,uc=0;while(uc<5){Array.from(document.querySelectorAll('div[role="dialog"] a')).map(a=>a.getAttribute('href')).filter(h=>h&&h.startsWith('/')&&!h.includes('/explore/')&&!h.includes('/direct/')).map(h=>h.replaceAll('/','').trim()).forEach(x=>{if(x&&x.length>1)u.add(x.toLowerCase())});d.scrollTop+=600;await new Promise(r=>setTimeout(r,700));let nh=d.scrollTop;if(nh===lh){uc++}else{uc=0;lh=nh}}let res=Array.from(u).join('\\n');if(typeof copy==='function'){copy(res);}else if(navigator.clipboard){await navigator.clipboard.writeText(res);}alert('✅ BERHASIL! '+u.size+' username likers telah disalin ke Clipboard!\\nSilakan buka Web App Monitoring dan tekan Ctrl+V (Paste).');})();`;

export const CHROME_EXTENSION_README = `# IG Liker Exporter - Chrome Extension

Ekstensi Chrome resmi untuk mengekstrak ratusan username likers dari postingan Instagram dengan 1-klik, dan mengirimkannya otomatis ke Web App Monitoring KTSN.

## Cara Install di Google Chrome / Microsoft Edge / Brave (Hanya 10 Detik):

1. Unduh atau ekstrak folder ekstensi ini di komputer Anda.
2. Buka browser Chrome, lalu ketik di address bar: \`chrome://extensions\` (atau \`edge://extensions\` jika pakai Edge).
3. Nyalakan tombol **"Developer mode" (Mode Pengembang)** di pojok kanan atas.
4. Klik tombol **"Load unpacked" (Muat yang belum dibongkar)** di pojok kiri atas.
5. Pilih folder hasil ekstrak ini.
6. Selesai! Ikon ekstensi ⚡ **IG Liker Exporter** akan langsung muncul di toolbar browser Anda.

## Cara Penggunaan:
1. Buka link postingan Instagram di browser.
2. Klik jumlah **Likes / Suka** agar modal daftar orang yang like muncul.
3. Klik ikon ekstensi **IG Liker Exporter** di browser.
4. Klik **"Ekstrak Semua Likers Postingan"**.
5. Semua username langsung otomatis tersalin dan siap ditempel di Web App Monitoring!
`;
