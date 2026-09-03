// Data dan template lengkap untuk Chrome Extension IG Liker Export & Bookmarklet
import JSZip from 'jszip';

export const CHROME_EXTENSION_MANIFEST = `{
  "manifest_version": 3,
  "name": "IG Liker Exporter - Retail Monitoring",
  "version": "1.1.0",
  "description": "Ekstrak otomatis daftar username yang like postingan Instagram dan kirim ke Web App Monitoring KTSN",
  "permissions": ["activeTab", "tabs", "scripting", "clipboardWrite", "storage"],
  "host_permissions": [
    "*://*.instagram.com/*",
    "https://*.instagram.com/*",
    "https://instagram.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Ekstrak Likers Instagram",
    "default_icon": "icon.png"
  },
  "icons": {
    "128": "icon.png"
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
    body { width: 340px; background: rgb(15, 23, 42); color: rgb(248, 250, 252); padding: 16px; font-size: 13px; }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid rgb(51, 65, 85); padding-bottom: 12px; }
    .logo { width: 28px; height: 28px; background: rgb(79, 70, 229); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
    .title { font-size: 14px; font-weight: 700; color: rgb(255, 255, 255); }
    .subtitle { font-size: 11px; color: rgb(148, 163, 184); }
    .card { background: rgb(30, 41, 59); border: 1px solid rgb(51, 65, 85); border-radius: 10px; padding: 12px; margin-bottom: 12px; }
    .btn { width: 100%; padding: 10px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
    .btn-primary { background: rgb(79, 70, 229); color: white; }
    .btn-primary:hover { background: rgb(67, 56, 202); }
    .btn-success { background: rgb(5, 150, 105); color: white; margin-top: 8px; }
    .btn-secondary { background: rgb(51, 65, 85); color: rgb(226, 232, 240); margin-top: 8px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .status { margin-top: 10px; font-size: 11px; padding: 8px; border-radius: 6px; background: rgb(15, 23, 42); border: 1px solid rgb(51, 65, 85); color: rgb(56, 189, 248); min-height: 36px; display: flex; align-items: center; line-height: 1.4; }
    .result-box { margin-top: 10px; display: none; }
    textarea { width: 100%; height: 90px; background: rgb(15, 23, 42); border: 1px solid rgb(71, 85, 105); border-radius: 6px; color: rgb(52, 211, 153); font-family: monospace; font-size: 11px; padding: 8px; resize: none; margin-top: 6px; }
    .badge { background: rgb(49, 46, 129); color: rgb(165, 180, 252); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⚡</div>
    <div>
      <div class="title">IG Liker Exporter</div>
      <div class="subtitle">Retail Engagement Monitor</div>
    </div>
  </div>

  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-weight: 600; color: rgb(226, 232, 240);">Langkah Ekstraksi:</span>
      <span class="badge">1-Klik Ekstrak</span>
    </div>
    <p style="font-size: 11px; color: rgb(148, 163, 184); line-height: 1.4; margin-bottom: 10px;">
      1. Buka postingan di Instagram Web.<br>
      2. Klik jumlah <b>Likes/Suka</b> agar modal daftar muncul.<br>
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
        <span style="font-size: 11px; font-weight: 600; color: rgb(52, 211, 153);" id="count-label">0 Username Ditemukan</span>
      </div>
      <textarea id="output-text" readonly placeholder="Daftar username akan muncul di sini..."></textarea>
      
      <button id="btn-copy" class="btn btn-success">
        <span>📋 Salin ke Clipboard</span>
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

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113);">Tab aktif tidak ditemukan.</span>';
        btnExtract.disabled = false;
        return;
      }

      if (tab.url && !tab.url.includes('instagram.com')) {
        statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113);">Buka halaman Instagram terlebih dahulu sebelum mengekstrak!</span>';
        btnExtract.disabled = false;
        return;
      }

      statusBox.innerHTML = '🚀 <span style="color: rgb(56,189,248);">Sedang auto-scroll & mengekstrak username likers...</span>';

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: inPageExtractor
      });

      btnExtract.disabled = false;

      if (!results || !results[0] || !results[0].result) {
        statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113);">Gagal mengambil data. Pastikan popup Likes di Instagram sudah diklik/terbuka!</span>';
        return;
      }

      const res = results[0].result;
      if (res.usernames && res.usernames.length > 0) {
        extractedList = res.usernames;
        const joined = extractedList.join('\\n');
        outputText.value = joined;
        countLabel.innerText = '✅ ' + extractedList.length + ' Username Berhasil Diekstrak!';
        statusBox.innerHTML = '✅ Sukses! Ditemukan <b>' + extractedList.length + '</b> username likers.';
        resultContainer.style.display = 'block';

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(joined).catch(() => {});
        }
      } else if (res.error === 'MODAL_NOT_OPEN') {
        statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113); font-weight: bold;">Popup Likes belum dibuka!</span><br><span style="font-size:10px; color: rgb(148,163,184);">Silakan klik jumlah "Likes/Suka" pada postingan IG terlebih dahulu, lalu klik tombol ini lagi.</span>';
      } else {
        statusBox.innerHTML = '⚠️ Tidak ada username yang terdeteksi. Pastikan modal daftar Likes Instagram terbuka di layar.';
      }
    } catch (err) {
      btnExtract.disabled = false;
      statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113);">Kesalahan: ' + (err.message || err) + '</span>';
      console.error(err);
    }
  });

  btnCopy.addEventListener('click', () => {
    if (outputText.value) {
      navigator.clipboard.writeText(outputText.value).then(() => {
        btnCopy.innerText = '✅ Tersalin!';
        setTimeout(() => {
          btnCopy.innerText = '📋 Salin ke Clipboard';
        }, 2000);
      });
    }
  });
});

// Function that runs directly inside the Instagram webpage tab
async function inPageExtractor() {
  var dialog = document.querySelector('div[role="dialog"]') || document.querySelector('div[aria-modal="true"]');
  if (!dialog) {
    var likeLink = document.querySelector('a[href*="/liked_by/"]') || document.querySelector('a[href*="/likes/"]');
    if (likeLink) {
      likeLink.click();
      await new Promise(function(r){ setTimeout(r, 600); });
      dialog = document.querySelector('div[role="dialog"]') || document.querySelector('div[aria-modal="true"]');
    }
  }

  if (!dialog) {
    return { error: 'MODAL_NOT_OPEN', usernames: [] };
  }

  // Find scrollable container inside dialog
  var scrollContainer = dialog;
  var allDivs = [dialog].concat(Array.from(dialog.querySelectorAll('div, section, ul')));
  for (var i = 0; i < allDivs.length; i++) {
    var el = allDivs[i];
    var style = window.getComputedStyle(el);
    if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      scrollContainer = el;
      break;
    }
  }

  var reservedWords = {
    'p':1,'reel':1,'reels':1,'stories':1,'explore':1,'direct':1,'accounts':1,'about':1,
    'legal':1,'privacy':1,'terms':1,'help':1,'settings':1,'profile':1,'home':1,
    'instagram':1,'following':1,'followers':1,'likes':1,'suka':1,'ikuti':1,'mengikuti':1,'liked_by':1,'tags':1
  };

  var allUsernames = new Set();
  var lastHeight = 0;
  var unchangedCount = 0;

  for (var step = 0; step < 45; step++) {
    var links = document.querySelectorAll('div[role="dialog"] a, div[aria-modal="true"] a, a[href^="/"]');
    links.forEach(function(a) {
      var h = a.getAttribute('href');
      if (h && typeof h === 'string') {
        var clean = h.replace(/https?:\\/\\/[^\\/]+/i, '').replace(/\\?.*$/, '').replace(/^\\/+/, '').replace(/\\/+$/, '').trim();
        if (clean && !clean.includes('/') && clean.length >= 2 && clean.length <= 32 && !reservedWords[clean.toLowerCase()]) {
          allUsernames.add(clean.toLowerCase());
        }
      }
    });

    var spans = document.querySelectorAll('div[role="dialog"] span, div[aria-modal="true"] span');
    spans.forEach(function(s) {
      var txt = (s.innerText || '').trim();
      if (/^[a-zA-Z0-9._]{3,30}$/.test(txt) && !reservedWords[txt.toLowerCase()]) {
        allUsernames.add(txt.toLowerCase());
      }
    });

    scrollContainer.scrollTop += 750;
    await new Promise(function(r) { setTimeout(r, 650); });

    var newHeight = scrollContainer.scrollTop;
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

export const CHROME_EXTENSION_CONTENT_JS = `// Content script for IG Liker Exporter
console.log('IG Liker Exporter content script active.');`;

// Ultra-robust bookmarklet:
// 1. Completely FREE of '#' characters to prevent URL fragment truncation in browsers
// 2. Visual floating mini HUD that ALWAYS opens on Instagram
// 3. Auto-detects Likes popup or offers 1-click retry without re-clicking bookmark
// 4. Real-time counter and dual-clipboard copy
export const BOOKMARKLET_CODE = `javascript:(function(){try{if(!location.hostname.includes('instagram.com')){alert('⚠️ Silakan buka postingan di Instagram Web (instagram.com) terlebih dahulu!');return;}var old=document.getElementById('ig-liker-exporter-hud');if(old){old.remove();}var hud=document.createElement('div');hud.id='ig-liker-exporter-hud';hud.style.cssText='position:fixed;top:20px;right:20px;z-index:999999999;width:340px;background:rgb(15,23,42);color:rgb(248,250,252);border-radius:14px;border:2px solid rgb(99,102,241);box-shadow:0 20px 45px rgba(0,0,0,0.8);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:16px;box-sizing:border-box;';hud.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgb(51,65,85);padding-bottom:10px;margin-bottom:10px;"><div style="display:flex;align-items:center;gap:8px;"><div style="background:rgb(79,70,229);color:rgb(255,255,255);width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">⚡</div><div><div style="font-weight:bold;font-size:13px;color:rgb(255,255,255);">IG Liker Exporter</div><div style="font-size:10px;color:rgb(148,163,184);">Retail Engagement Monitor</div></div></div><button id="ig-close-hud" style="background:none;border:none;color:rgb(148,163,184);cursor:pointer;font-size:20px;line-height:1;padding:2px 6px;">&times;</button></div><div id="ig-status-text" style="font-size:12px;color:rgb(56,189,248);margin-bottom:10px;background:rgb(30,41,59);padding:8px 10px;border-radius:8px;border:1px solid rgb(51,65,85);line-height:1.4;">⏳ Memeriksa popup Like Instagram...</div><div id="ig-result-box" style="display:none;"><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:bold;color:rgb(52,211,153);margin-bottom:6px;"><span id="ig-count-text">0 Username</span><span>Siap di-Paste</span></div><textarea id="ig-usernames-area" style="width:100%;height:100px;background:rgb(2,6,23);color:rgb(74,222,128);font-family:monospace;font-size:11px;padding:8px;border-radius:8px;border:1px solid rgb(51,65,85);box-sizing:border-box;resize:none;" readonly></textarea><div style="display:flex;gap:8px;margin-top:10px;"><button id="ig-btn-copy-hud" style="flex:1;background:rgb(5,150,105);color:rgb(255,255,255);border:none;border-radius:8px;padding:10px;font-weight:bold;font-size:12px;cursor:pointer;">📋 Salin ke Clipboard</button></div></div><div id="ig-loading-bar" style="height:4px;background:rgb(30,41,59);border-radius:2px;overflow:hidden;margin-top:8px;"><div id="ig-progress-inner" style="height:100%;background:rgb(99,102,241);width:20%;transition:width 0.3s;"></div></div><div id="ig-action-bar" style="margin-top:10px;display:none;"><button id="ig-retry-btn" style="width:100%;background:rgb(79,70,229);color:rgb(255,255,255);border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:bold;cursor:pointer;">🔄 Mulai Ekstrak Lagi</button></div>';document.body.appendChild(hud);document.getElementById('ig-close-hud').onclick=function(){hud.remove();};var statusEl=document.getElementById('ig-status-text'),resultBox=document.getElementById('ig-result-box'),countText=document.getElementById('ig-count-text'),area=document.getElementById('ig-usernames-area'),btnCopy=document.getElementById('ig-btn-copy-hud'),progress=document.getElementById('ig-progress-inner'),actionBar=document.getElementById('ig-action-bar'),retryBtn=document.getElementById('ig-retry-btn');var reservedWords={'p':1,'reel':1,'reels':1,'stories':1,'explore':1,'direct':1,'accounts':1,'about':1,'legal':1,'privacy':1,'terms':1,'help':1,'settings':1,'profile':1,'home':1,'instagram':1,'following':1,'followers':1,'likes':1,'suka':1,'ikuti':1,'mengikuti':1,'liked_by':1,'tags':1};var usernamesSet=new Set(),lastHeight=0,unchangedCount=0,step=0;function copyTextFallback(text){try{var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.top='-9999px';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);return true;}catch(e){return false;}}function findModalAndContainer(){var dialog=document.querySelector('div[role=\"dialog\"]')||document.querySelector('div[aria-modal=\"true\"]');if(!dialog){var likeLink=document.querySelector('a[href*=\"/liked_by/\"]')||document.querySelector('a[href*=\"/likes/\"]');if(likeLink){try{likeLink.click();}catch(e){}}return{dialog:null,container:null};}var all=[dialog].concat(Array.from(dialog.querySelectorAll('div, section, ul')));for(var i=0;i<all.length;i++){var el=all[i];var st=window.getComputedStyle(el);if((st.overflowY==='auto'||st.overflowY==='scroll')&&el.scrollHeight>el.clientHeight){return{dialog:dialog,container:el};}}var best=dialog,maxS=0;for(var j=0;j<all.length;j++){if(all[j].scrollHeight>all[j].clientHeight&&all[j].scrollHeight>maxS){maxS=all[j].scrollHeight;best=all[j];}}return{dialog:dialog,container:best};}function extractCurrent(){var links=document.querySelectorAll('div[role=\"dialog\"] a, div[aria-modal=\"true\"] a, a[href^=\"/\"]');links.forEach(function(a){var h=a.getAttribute('href');if(h&&typeof h==='string'){var clean=h.replace(/https?:\\/\\/[^\\/]+/i,'').replace(/\\?.*$/,'').replace(/^\\/+/,'').replace(/\\/+$/,'').trim();if(clean&&!clean.includes('/')&&clean.length>=2&&clean.length<=32&&!reservedWords[clean.toLowerCase()]){usernamesSet.add(clean.toLowerCase());}}});var spans=document.querySelectorAll('div[role=\"dialog\"] span, div[aria-modal=\"true\"] span');spans.forEach(function(s){var txt=(s.innerText||'').trim();if(/^[a-zA-Z0-9._]{3,30}$/.test(txt)&&!reservedWords[txt.toLowerCase()]){usernamesSet.add(txt.toLowerCase());}});}function finishExtraction(){progress.style.width='100%';var list=Array.from(usernamesSet);var text=list.join('\\n');if(list.length===0){statusEl.innerHTML='⚠️ <span style=\"color:rgb(248,113,113);font-weight:bold;\">Tidak ada username terdeteksi.</span><br><span style=\"font-size:10px;color:rgb(148,163,184);\">Pastikan modal daftar Suka/Likes Instagram sudah muncul di layar, lalu klik Mulai Ekstrak Lagi.</span>';actionBar.style.display='block';return;}statusEl.innerHTML='✅ <b style=\"color:rgb(74,222,128);\">Selesai!</b> Ditemukan <b>'+list.length+'</b> username likers.';resultBox.style.display='block';actionBar.style.display='block';countText.innerText=list.length+' Username Terdeteksi';area.value=text;copyTextFallback(text);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).catch(function(){});}btnCopy.onclick=function(){copyTextFallback(text);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).catch(function(){});}btnCopy.innerText='✅ Berhasil Disalin!';setTimeout(function(){btnCopy.innerText='📋 Salin ke Clipboard';},2000);};}function startExtraction(container){statusEl.innerHTML='🚀 <span style=\"color:rgb(56,189,248);\">Sedang auto-scroll & mengumpulkan username likers...</span>';function doScrollLoop(){extractCurrent();step++;var percent=Math.min(95,step*3);progress.style.width=percent+'%';statusEl.innerHTML='🚀 Mengumpulkan... (<b>'+usernamesSet.size+'</b> username)';container.scrollTop+=750;setTimeout(function(){var newHeight=container.scrollTop;if(newHeight===lastHeight){unchangedCount++;}else{unchangedCount=0;lastHeight=newHeight;}if(unchangedCount>=4||step>=45){finishExtraction();}else{doScrollLoop();}},650);}doScrollLoop();}retryBtn.onclick=function(){usernamesSet.clear();step=0;unchangedCount=0;lastHeight=0;resultBox.style.display='none';actionBar.style.display='none';progress.style.width='10%';run();};function run(){var found=findModalAndContainer();if(!found.container){statusEl.innerHTML='⚠️ <span style=\"color:rgb(248,113,113);font-weight:bold;\">Popup Likes belum terbuka!</span><br><span style=\"font-size:11px;color:rgb(148,163,184);display:block;margin-top:4px;\">Klik tulisan jumlah <b>Likes/Suka</b> di postingan IG, lalu klik tombol di bawah ini:</span>';actionBar.style.display='block';return;}startExtraction(found.container);}run();}catch(err){alert('Kesalahan bookmarklet: '+err.message);}})();`;

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
3. Klik ikon ekstensi **IG Liker Exporter** di toolbar browser.
4. Klik **"Ekstrak Semua Likers Postingan"**.
5. Semua username langsung otomatis tersalin dan siap ditempel di Web App Monitoring!
`;

// Helper: Generate icon.png for extension zip
export function generateExtensionIconBlob(): Promise<Blob> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(new Blob());
        return;
      }
      // Rounded background
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, 128, 128, 28);
      } else {
        ctx.rect(0, 0, 128, 128);
      }
      ctx.fill();

      // Lightning symbol
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(70, 18);
      ctx.lineTo(36, 72);
      ctx.lineTo(62, 72);
      ctx.lineTo(54, 110);
      ctx.lineTo(92, 56);
      ctx.lineTo(66, 56);
      ctx.closePath();
      ctx.fill();

      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/png');
    } catch {
      resolve(new Blob());
    }
  });
}

// Helper: Download Extension ZIP directly
export async function downloadExtensionZip(): Promise<void> {
  const zip = new JSZip();

  // Add files
  zip.file('manifest.json', CHROME_EXTENSION_MANIFEST);
  zip.file('popup.html', CHROME_EXTENSION_POPUP_HTML);
  zip.file('popup.js', CHROME_EXTENSION_POPUP_JS);
  zip.file('content.js', CHROME_EXTENSION_CONTENT_JS);
  zip.file('README.md', CHROME_EXTENSION_README);

  // Generate icon.png
  const iconBlob = await generateExtensionIconBlob();
  if (iconBlob && iconBlob.size > 0) {
    zip.file('icon.png', iconBlob);
  }

  // Generate zip
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'IG-Liker-Exporter-Chrome-Extension.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
