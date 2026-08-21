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
        btnCopy.innerText = '✅ Tersalin!';
        setTimeout(() => {
          btnCopy.innerText = '📋 Salin ke Clipboard & Buka Web App';
        }, 2000);
      });
    }
  });
});

// Function that runs directly inside the Instagram webpage tab
async function inPageExtractor() {
  const dialog = document.querySelector('div[role="dialog"]') || document.querySelector('div[aria-modal="true"]');
  if (!dialog) {
    return { error: 'MODAL_NOT_OPEN', usernames: [] };
  }

  // Find scrollable container inside dialog
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

  for (let step = 0; step < 45; step++) {
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

    const spans = document.querySelectorAll('div[role="dialog"] span, div[aria-modal="true"] span');
    spans.forEach(s => {
      const txt = (s.innerText || '').trim();
      if (/^[a-zA-Z0-9._]{3,30}$/.test(txt) && !reservedWords[txt.toLowerCase()]) {
        allUsernames.add(txt.toLowerCase());
      }
    });

    scrollContainer.scrollTop += 700;
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

  return { usernames: Array.from(allUsernames) };
}`;

export const CHROME_EXTENSION_CONTENT_JS = `// Background listener if needed
console.log('IG Liker Exporter content script active.');`;

// Ultra-robust bookmarklet with on-screen visual HUD & fallback clipboard engine
export const BOOKMARKLET_CODE = `javascript:(function(){try{if(!location.hostname.includes('instagram.com')){alert('⚠️ Silakan buka postingan di Instagram Web (instagram.com) terlebih dahulu!');return;}var old=document.getElementById('ig-liker-exporter-hud');if(old){old.remove();}var hud=document.createElement('div');hud.id='ig-liker-exporter-hud';hud.style.cssText='position:fixed;top:24px;right:24px;z-index:99999999;width:340px;background:#0f172a;color:#fff;border-radius:14px;border:2px solid #6366f1;box-shadow:0 20px 45px rgba(0,0,0,0.7);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:16px;box-sizing:border-box;';hud.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:10px;margin-bottom:10px;"><div style="display:flex;align-items:center;gap:8px;"><div style="background:#4f46e5;color:#fff;width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">⚡</div><div><div style="font-weight:bold;font-size:13px;color:#fff;">IG Liker Exporter</div><div style="font-size:10px;color:#94a3b8;">Retail Engagement Monitor</div></div></div><button id="ig-close-hud" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;line-height:1;padding:4px;">&times;</button></div><div id="ig-status-text" style="font-size:12px;color:#38bdf8;margin-bottom:10px;background:#1e293b;padding:8px 10px;border-radius:8px;border:1px solid #334155;">⏳ Memeriksa popup Like Instagram...</div><div id="ig-result-box" style="display:none;"><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:bold;color:#34d399;margin-bottom:6px;"><span id="ig-count-text">0 Username</span><span>Siap di-Paste</span></div><textarea id="ig-usernames-area" style="width:100%;height:100px;background:#020617;color:#4ade80;font-family:monospace;font-size:11px;padding:8px;border-radius:8px;border:1px solid #334155;box-sizing:border-box;resize:none;" readonly></textarea><div style="display:flex;gap:8px;margin-top:10px;"><button id="ig-btn-copy-hud" style="flex:1;background:#059669;color:#fff;border:none;border-radius:8px;padding:10px;font-weight:bold;font-size:12px;cursor:pointer;">📋 Salin ke Clipboard</button></div></div><div id="ig-loading-bar" style="height:4px;background:#1e293b;border-radius:2px;overflow:hidden;margin-top:8px;"><div id="ig-progress-inner" style="height:100%;background:#6366f1;width:20%;transition:width 0.3s;"></div></div>';document.body.appendChild(hud);document.getElementById('ig-close-hud').onclick=function(){hud.remove();};var statusEl=document.getElementById('ig-status-text'),resultBox=document.getElementById('ig-result-box'),countText=document.getElementById('ig-count-text'),area=document.getElementById('ig-usernames-area'),btnCopy=document.getElementById('ig-btn-copy-hud'),progress=document.getElementById('ig-progress-inner');function findScrollContainer(){var dialog=document.querySelector('div[role="dialog"]')||document.querySelector('div[aria-modal="true"]');if(!dialog)return null;var allDivs=dialog.querySelectorAll('div, section, ul');for(var i=0;i<allDivs.length;i++){var el=allDivs[i];var st=window.getComputedStyle(el);if((st.overflowY==='auto'||st.overflowY==='scroll')&&el.scrollHeight>el.clientHeight){return el;}}return dialog;}var scrollContainer=findScrollContainer();if(!scrollContainer){statusEl.innerHTML='⚠️ <span style=\\"color:#f87171;font-weight:bold;\\">Popup Likes belum dibuka!</span><br><span style=\\"font-size:11px;color:#94a3b8;display:block;margin-top:4px;\\">Silakan klik jumlah <b>Likes/Suka</b> di postingan IG terlebih dahulu, lalu klik bookmark ini lagi.</span>';return;}statusEl.innerHTML='🚀 <span style=\\"color:#38bdf8;\\">Sedang auto-scroll & mengumpulkan username likers...</span>';var reservedWords={'p':1,'reel':1,'reels':1,'stories':1,'explore':1,'direct':1,'accounts':1,'about':1,'legal':1,'privacy':1,'terms':1,'help':1,'settings':1,'profile':1,'home':1,'instagram':1,'following':1,'followers':1,'likes':1,'suka':1,'ikuti':1,'mengikuti':1};var usernamesSet=new Set(),lastHeight=0,unchangedCount=0,step=0;function extractCurrent(){var links=document.querySelectorAll('div[role=\"dialog\"] a, div[aria-modal=\"true\"] a');links.forEach(function(a){var h=a.getAttribute('href');if(h&&typeof h==='string'){var clean=h.replace(/https?:\\/\\/[^\\/]+/i,'').replace(/\\?.*$/,'').replace(/^\\/+/,'').replace(/\\/+$/,'').trim();if(clean&&!clean.includes('/')&&clean.length>=2&&clean.length<=32&&!reservedWords[clean.toLowerCase()]){usernamesSet.add(clean.toLowerCase());}}});var spans=document.querySelectorAll('div[role=\"dialog\"] span, div[aria-modal=\"true\"] span');spans.forEach(function(s){var txt=(s.innerText||'').trim();if(/^[a-zA-Z0-9._]{3,30}$/.test(txt)&&!reservedWords[txt.toLowerCase()]){usernamesSet.add(txt.toLowerCase());}});}function copyTextFallback(text){try{var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.top='-9999px';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);return true;}catch(e){return false;}}function finishExtraction(){progress.style.width='100%';var list=Array.from(usernamesSet);var text=list.join('\\n');if(list.length===0){statusEl.innerHTML='⚠️ <span style=\\"color:#f87171;\\">Tidak ada username terdeteksi.</span><br><span style=\\"font-size:10px;color:#94a3b8;\\">Pastikan modal daftar Suka/Likes Instagram sudah muncul di layar.</span>';return;}statusEl.innerHTML='✅ <b style=\\"color:#4ade80;\\">Selesai!</b> Ditemukan <b>'+list.length+'</b> username.';resultBox.style.display='block';countText.innerText=list.length+' Username Terdeteksi';area.value=text;copyTextFallback(text);if(navigator.clipboard){navigator.clipboard.writeText(text).catch(function(){});}btnCopy.onclick=function(){copyTextFallback(text);if(navigator.clipboard){navigator.clipboard.writeText(text).catch(function(){});}btnCopy.innerText='✅ Berhasil Disalin!';setTimeout(function(){btnCopy.innerText='📋 Salin ke Clipboard';},2000);};}function doScrollLoop(){extractCurrent();step++;var percent=Math.min(95,step*3);progress.style.width=percent+'%';statusEl.innerHTML='🚀 Mengumpulkan... (<b>'+usernamesSet.size+'</b> username)';scrollContainer.scrollTop+=750;setTimeout(function(){var newHeight=scrollContainer.scrollTop;if(newHeight===lastHeight){unchangedCount++;}else{unchangedCount=0;lastHeight=newHeight;}if(unchangedCount>=4||step>=45){finishExtraction();}else{doScrollLoop();}},650);}doScrollLoop();}catch(err){alert('Kesalahan bookmarklet: '+err.message);}})();`;

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
