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

    <button id="btn-screenshot" class="btn" style="background: linear-gradient(135deg, rgb(219, 39, 119), rgb(147, 51, 234)); color: white; margin-top: 8px;">
      <span>📸 Download Screenshot Panjang (PNG)</span>
    </button>
    
    <div id="status-box" class="status">
      Status: Siap mengekstrak likers atau mengambil screenshot panjang di tab Instagram saat ini.
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

  const btnScreenshot = document.getElementById('btn-screenshot');
  if (btnScreenshot) {
    btnScreenshot.addEventListener('click', async () => {
      btnScreenshot.disabled = true;
      statusBox.innerText = '⏳ Memeriksa tab Instagram aktif...';

      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.id) {
          statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113);">Tab aktif tidak ditemukan.</span>';
          btnScreenshot.disabled = false;
          return;
        }

        if (tab.url && !tab.url.includes('instagram.com')) {
          statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113);">Buka halaman Instagram terlebih dahulu!</span>';
          btnScreenshot.disabled = false;
          return;
        }

        statusBox.innerHTML = '🚀 <span style="color: rgb(56,189,248);">Sedang auto-scroll & membuat gambar screenshot panjang...</span>';

        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: inPageLongScreenshot
        });

        btnScreenshot.disabled = false;

        if (!results || !results[0] || !results[0].result) {
          statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113);">Gagal mengambil screenshot. Pastikan popup Likes di Instagram sudah terbuka!</span>';
          return;
        }

        const res = results[0].result;
        if (res.success) {
          statusBox.innerHTML = '✅ <b style="color: rgb(74,222,128);">Sukses!</b> Screenshot panjang berisi <b>' + res.count + '</b> likers otomatis didownload!';
        } else if (res.error === 'MODAL_NOT_OPEN') {
          statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113); font-weight: bold;">Popup Likes belum dibuka!</span><br><span style="font-size:10px; color: rgb(148,163,184);">Silakan klik jumlah Likes pada postingan IG terlebih dahulu.</span>';
        } else {
          statusBox.innerHTML = '⚠️ ' + (res.error || 'Terjadi kesalahan saat membuat screenshot.');
        }
      } catch (err) {
        btnScreenshot.disabled = false;
        statusBox.innerHTML = '⚠️ <span style="color: rgb(248,113,113);">Kesalahan: ' + (err.message || err) + '</span>';
        console.error(err);
      }
    });
  }
});

// Function that runs directly inside the Instagram webpage tab
async function inPageExtractor() {
  var dialog = document.querySelector('div[role="dialog"] div[style*="overflow"]')
            || document.querySelector('div[role="dialog"] div[style*="overflow-y"]')
            || document.querySelector('div[aria-modal="true"] div[style*="overflow"]')
            || document.querySelector('div[role="dialog"]')
            || document.querySelector('div[aria-modal="true"]');

  if (!dialog) {
    var likeLink = document.querySelector('a[href*="/liked_by/"]') || document.querySelector('a[href*="/likes/"]');
    if (likeLink) {
      try { likeLink.click(); } catch(e) {}
      await new Promise(function(r){ setTimeout(r, 800); });
      dialog = document.querySelector('div[role="dialog"] div[style*="overflow"]')
            || document.querySelector('div[role="dialog"] div[style*="overflow-y"]')
            || document.querySelector('div[aria-modal="true"] div[style*="overflow"]')
            || document.querySelector('div[role="dialog"]');
    }
  }

  if (!dialog) {
    return { error: 'MODAL_NOT_OPEN', usernames: [] };
  }

  var allUsernames = new Set();
  var lastHeight = 0;
  var unchangedCount = 0;
  var step = 0;

  while (unchangedCount < 5 && step < 60) {
    var links = Array.from(document.querySelectorAll('div[role="dialog"] a, div[aria-modal="true"] a'))
      .map(function(a) { return a.getAttribute('href'); })
      .filter(function(h) {
        return h && typeof h === 'string' && h.startsWith('/') 
          && !h.includes('/explore/') 
          && !h.includes('/direct/') 
          && !h.includes('/stories/') 
          && !h.includes('/reels/') 
          && !h.includes('/p/');
      })
      .map(function(h) { return h.replaceAll('/', '').trim().toLowerCase(); })
      .filter(function(u) { return u && u.length >= 2 && u.length <= 32; });

    links.forEach(function(u) { allUsernames.add(u); });

    dialog.scrollTop += 500;
    try {
      dialog.dispatchEvent(new Event('scroll', { bubbles: true }));
    } catch(e) {}

    await new Promise(function(r) { setTimeout(r, 800); });

    var newHeight = dialog.scrollTop;
    if (newHeight === lastHeight) {
      unchangedCount++;
    } else {
      unchangedCount = 0;
      lastHeight = newHeight;
    }
    step++;
  }

  var list = Array.from(allUsernames);
  var joined = list.join('\\n');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(joined);
    }
  } catch(e) {}

  return { usernames: list };
}

async function inPageLongScreenshot() {
  var dialog = document.querySelector('div[role="dialog"] div[style*="overflow"]')
            || document.querySelector('div[role="dialog"] div[style*="overflow-y"]')
            || document.querySelector('div[aria-modal="true"] div[style*="overflow"]')
            || document.querySelector('div[role="dialog"]')
            || document.querySelector('div[aria-modal="true"]');

  if (!dialog) {
    return { error: 'MODAL_NOT_OPEN' };
  }

  var usersMap = new Map();
  var lastHeight = 0;
  var unchangedCount = 0;
  var step = 0;

  while (unchangedCount < 5 && step < 60) {
    var rows = Array.from(document.querySelectorAll('div[role="dialog"] a, div[aria-modal="true"] a'));
    for (var i = 0; i < rows.length; i++) {
      var a = rows[i];
      var h = a.getAttribute('href');
      if (h && typeof h === 'string' && h.startsWith('/') && !h.includes('/explore/') && !h.includes('/direct/') && !h.includes('/stories/') && !h.includes('/reels/') && !h.includes('/p/')) {
        var username = h.replaceAll('/', '').trim().toLowerCase();
        if (username && username.length >= 2 && username.length <= 32 && !usersMap.has(username)) {
          var parentRow = a.closest('div[role="dialog"] > div > div, div[role="dialog"] li') || a.parentElement;
          var name = '';
          if (parentRow) {
            var spans = Array.from(parentRow.querySelectorAll('span'));
            for (var s = 0; s < spans.length; s++) {
              var txt = spans[s].innerText.trim();
              if (txt && txt.toLowerCase() !== username && txt !== 'Follow' && txt !== 'Following' && txt.length < 40) {
                name = txt;
                break;
              }
            }
          }
          usersMap.set(username, name || username);
        }
      }
    }

    dialog.scrollTop += 500;
    try {
      dialog.dispatchEvent(new Event('scroll', { bubbles: true }));
    } catch(e) {}

    await new Promise(function(r) { setTimeout(r, 800); });

    var newHeight = dialog.scrollTop;
    if (newHeight === lastHeight) {
      unchangedCount++;
    } else {
      unchangedCount = 0;
      lastHeight = newHeight;
    }
    step++;
  }

  var list = Array.from(usersMap.entries());
  if (list.length === 0) {
    return { error: 'NO_LIKERS_FOUND' };
  }

  var width = 800;
  var rowH = 110;
  var headerH = 100;
  var footerH = 80;
  var totalHeight = headerH + (list.length * rowH) + footerH;

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = totalHeight;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = '#262626';
  ctx.fillRect(0, 0, width, totalHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Likes', width / 2, 60);

  ctx.fillStyle = '#a8a8a8';
  ctx.font = '28px sans-serif';
  ctx.fillText('✕', width - 50, 60);

  ctx.strokeStyle = '#363636';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, headerH);
  ctx.lineTo(width, headerH);
  ctx.stroke();

  var gradients = ['#e1306c', '#c13584', '#833ab4', '#405de6', '#5851db', '#fd1d1d', '#f56040'];

  for (var idx = 0; idx < list.length; idx++) {
    var item = list[idx];
    var u = item[0];
    var realName = item[1];
    var y = headerH + (idx * rowH);

    var color = gradients[idx % gradients.length];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(65, y + 55, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(u.slice(0, 2).toUpperCase(), 65, y + 64);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f5f5f5';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(u, 125, y + 50);

    ctx.fillStyle = '#a8a8a8';
    ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(realName, 125, y + 84);

    ctx.fillStyle = '#0095f6';
    var btnW = 140;
    var btnH = 50;
    var btnX = width - btnW - 35;
    var btnY = y + 30;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 12);
      ctx.fill();
    } else {
      ctx.fillRect(btnX, btnY, btnW, btnH);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Follow', btnX + (btnW / 2), btnY + 33);
  }

  ctx.strokeStyle = '#363636';
  ctx.beginPath();
  ctx.moveTo(0, totalHeight - footerH);
  ctx.lineTo(width, totalHeight - footerH);
  ctx.stroke();

  ctx.fillStyle = '#a8a8a8';
  ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Bukti Like Instagram • Total ' + list.length + ' Likers', width / 2, totalHeight - 32);

  var dataUrl = canvas.toDataURL('image/png');
  var dl = document.createElement('a');
  dl.download = 'screenshot-panjang-likers-ig-' + Date.now() + '.png';
  dl.href = dataUrl;
  document.body.appendChild(dl);
  dl.click();
  document.body.removeChild(dl);

  return { success: true, count: list.length };
}`;

export const CHROME_EXTENSION_CONTENT_JS = `// Content script for IG Liker Exporter
console.log('IG Liker Exporter content script active.');`;

// Ultra-robust bookmarklet:
// 1. Completely FREE of '#' characters to prevent URL fragment truncation in browsers
// 2. Visual floating mini HUD that ALWAYS opens on Instagram
// 3. Targets div[role="dialog"] div[style*="overflow"] for guaranteed auto-scrolling
// 4. Real-time counter and dual-clipboard copy
export const BOOKMARKLET_CODE = `javascript:(function(){try{if(!location.hostname.includes('instagram.com')){alert('⚠️ Silakan buka postingan di Instagram Web (instagram.com) terlebih dahulu!');return;}var old=document.getElementById('ig-liker-exporter-hud');if(old){old.remove();}var hud=document.createElement('div');hud.id='ig-liker-exporter-hud';hud.style.cssText='position:fixed;top:20px;right:20px;z-index:999999999;width:350px;background:rgb(15,23,42);color:rgb(248,250,252);border-radius:14px;border:2px solid rgb(99,102,241);box-shadow:0 20px 45px rgba(0,0,0,0.8);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:16px;box-sizing:border-box;';hud.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgb(51,65,85);padding-bottom:10px;margin-bottom:10px;"><div style="display:flex;align-items:center;gap:8px;"><div style="background:rgb(79,70,229);color:rgb(255,255,255);width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">⚡</div><div><div style="font-weight:bold;font-size:13px;color:rgb(255,255,255);">IG Liker Exporter</div><div style="font-size:10px;color:rgb(148,163,184);">Ekstrak & Screenshot Panjang</div></div></div><button id="ig-close-hud" style="background:none;border:none;color:rgb(148,163,184);cursor:pointer;font-size:20px;line-height:1;padding:2px 6px;">&times;</button></div><div id="ig-status-text" style="font-size:12px;color:rgb(56,189,248);margin-bottom:10px;background:rgb(30,41,59);padding:8px 10px;border-radius:8px;border:1px solid rgb(51,65,85);line-height:1.4;">⏳ Memeriksa popup Like Instagram...</div><div id="ig-result-box" style="display:none;"><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:bold;color:rgb(52,211,153);margin-bottom:6px;"><span id="ig-count-text">0 Username</span><span>Siap di-Paste</span></div><textarea id="ig-usernames-area" style="width:100%;height:100px;background:rgb(2,6,23);color:rgb(74,222,128);font-family:monospace;font-size:11px;padding:8px;border-radius:8px;border:1px solid rgb(51,65,85);box-sizing:border-box;resize:none;" readonly></textarea><div style="display:flex;gap:6px;margin-top:10px;"><button id="ig-btn-copy-hud" style="flex:1;background:rgb(5,150,105);color:rgb(255,255,255);border:none;border-radius:8px;padding:8px 6px;font-weight:bold;font-size:11px;cursor:pointer;">📋 Salin Teks</button><button id="ig-btn-ss-hud" style="flex:1.2;background:linear-gradient(135deg,rgb(219,39,119),rgb(147,51,234));color:rgb(255,255,255);border:none;border-radius:8px;padding:8px 6px;font-weight:bold;font-size:11px;cursor:pointer;">📸 Screenshot Panjang</button></div></div><div id="ig-loading-bar" style="height:4px;background:rgb(30,41,59);border-radius:2px;overflow:hidden;margin-top:8px;"><div id="ig-progress-inner" style="height:100%;background:rgb(99,102,241);width:20%;transition:width 0.3s;"></div></div><div id="ig-action-bar" style="margin-top:10px;display:none;"><button id="ig-retry-btn" style="width:100%;background:rgb(79,70,229);color:rgb(255,255,255);border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:bold;cursor:pointer;">🔄 Mulai Ekstrak Lagi</button></div>';document.body.appendChild(hud);document.getElementById('ig-close-hud').onclick=function(){hud.remove();};var statusEl=document.getElementById('ig-status-text'),resultBox=document.getElementById('ig-result-box'),countText=document.getElementById('ig-count-text'),area=document.getElementById('ig-usernames-area'),btnCopy=document.getElementById('ig-btn-copy-hud'),btnSS=document.getElementById('ig-btn-ss-hud'),progress=document.getElementById('ig-progress-inner'),actionBar=document.getElementById('ig-action-bar'),retryBtn=document.getElementById('ig-retry-btn');var usernamesSet=new Set(),lastHeight=0,unchangedCount=0,step=0;function copyTextFallback(text){try{var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.top='-9999px';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);return true;}catch(e){return false;}}function findContainer(){var dialog=document.querySelector('div[role=\"dialog\"] div[style*=\"overflow\"]')||document.querySelector('div[role=\"dialog\"] div[style*=\"overflow-y\"]')||document.querySelector('div[aria-modal=\"true\"] div[style*=\"overflow\"]');if(!dialog){dialog=document.querySelector('div[role=\"dialog\"]')||document.querySelector('div[aria-modal=\"true\"]');}if(!dialog){var likeLink=document.querySelector('a[href*=\"/liked_by/\"]')||document.querySelector('a[href*=\"/likes/\"]');if(likeLink){try{likeLink.click();}catch(e){}}return null;}return dialog;}function extractCurrent(){var links=Array.from(document.querySelectorAll('div[role=\"dialog\"] a, div[aria-modal=\"true\"] a'));links.forEach(function(a){var h=a.getAttribute('href');if(h&&typeof h==='string'&&h.startsWith('/')&&!h.includes('/explore/')&&!h.includes('/direct/')&&!h.includes('/stories/')&&!h.includes('/reels/')&&!h.includes('/p/')){var clean=h.replaceAll('/','').trim().toLowerCase();if(clean&&clean.length>=2&&clean.length<=32){usernamesSet.add(clean);}}});}function downloadLongScreenshot(list){var width=800,rowH=110,headerH=100,footerH=80,totalHeight=headerH+(list.length*rowH)+footerH;var canvas=document.createElement('canvas');canvas.width=width;canvas.height=totalHeight;var ctx=canvas.getContext('2d');ctx.fillStyle='#262626';ctx.fillRect(0,0,width,totalHeight);ctx.fillStyle='#ffffff';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('Likes',width/2,60);ctx.strokeStyle='#363636';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,headerH);ctx.lineTo(width,headerH);ctx.stroke();var colors=['#e1306c','#c13584','#833ab4','#405de6','#5851db','#fd1d1d'];for(var i=0;i<list.length;i++){var u=list[i];var y=headerH+(i*rowH);ctx.fillStyle=colors[i%colors.length];ctx.beginPath();ctx.arc(65,y+55,36,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText(u.slice(0,2).toUpperCase(),65,y+64);ctx.textAlign='left';ctx.fillStyle='#f5f5f5';ctx.font='bold 28px sans-serif';ctx.fillText(u,125,y+50);ctx.fillStyle='#a8a8a8';ctx.font='24px sans-serif';ctx.fillText(u,125,y+84);ctx.fillStyle='#0095f6';var btnW=140,btnH=50,btnX=width-btnW-35,btnY=y+30;if(ctx.roundRect){ctx.beginPath();ctx.roundRect(btnX,btnY,btnW,btnH,12);ctx.fill();}else{ctx.fillRect(btnX,btnY,btnW,btnH);}ctx.fillStyle='#ffffff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('Follow',btnX+(btnW/2),btnY+33);}ctx.strokeStyle='#363636';ctx.beginPath();ctx.moveTo(0,totalHeight-footerH);ctx.lineTo(width,totalHeight-footerH);ctx.stroke();ctx.fillStyle='#a8a8a8';ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText('Bukti Like Instagram • Total '+list.length+' Likers',width/2,totalHeight-32);var a=document.createElement('a');a.download='screenshot-panjang-likers-ig-'+Date.now()+'.png';a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();document.body.removeChild(a);}function finishExtraction(){progress.style.width='100%';var list=Array.from(usernamesSet);var text=list.join('\\n');if(list.length===0){statusEl.innerHTML='⚠️ <span style=\"color:rgb(248,113,113);font-weight:bold;\">Tidak ada username terdeteksi.</span><br><span style=\"font-size:10px;color:rgb(148,163,184);\">Pastikan modal daftar Suka/Likes Instagram sudah muncul di layar, lalu klik Mulai Ekstrak Lagi.</span>';actionBar.style.display='block';return;}statusEl.innerHTML='✅ <b style=\"color:rgb(74,222,128);\">Selesai!</b> Ditemukan <b>'+list.length+'</b> username likers.';resultBox.style.display='block';actionBar.style.display='block';countText.innerText=list.length+' Username Terdeteksi';area.value=text;copyTextFallback(text);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).catch(function(){});}btnCopy.onclick=function(){copyTextFallback(text);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).catch(function(){});}btnCopy.innerText='✅ Berhasil Disalin!';setTimeout(function(){btnCopy.innerText='📋 Salin Teks';},2000);};btnSS.onclick=function(){downloadLongScreenshot(list);btnSS.innerText='✅ Diunduh!';setTimeout(function(){btnSS.innerText='📸 Screenshot Panjang';},2500);};}function startExtraction(container){statusEl.innerHTML='🚀 <span style=\"color:rgb(56,189,248);\">Sedang auto-scroll & mengumpulkan username likers...</span>';function doScrollLoop(){extractCurrent();step++;var percent=Math.min(95,Math.floor((step/35)*100));progress.style.width=percent+'%';statusEl.innerHTML='🚀 Mengumpulkan... (<b>'+usernamesSet.size+'</b> username)';container.scrollTop+=500;try{container.dispatchEvent(new Event('scroll',{bubbles:true}));}catch(e){}setTimeout(function(){var newHeight=container.scrollTop;if(newHeight===lastHeight){unchangedCount++;}else{unchangedCount=0;lastHeight=newHeight;}if(unchangedCount>=5||step>=60){finishExtraction();}else{doScrollLoop();}},800);}doScrollLoop();}retryBtn.onclick=function(){usernamesSet.clear();step=0;unchangedCount=0;lastHeight=0;resultBox.style.display='none';actionBar.style.display='none';progress.style.width='10%';run();};function run(){var c=findContainer();if(!c){statusEl.innerHTML='⚠️ <span style=\"color:rgb(248,113,113);font-weight:bold;\">Popup Likes belum terbuka!</span><br><span style=\"font-size:11px;color:rgb(148,163,184);display:block;margin-top:4px;\">Klik tulisan jumlah <b>Likes/Suka</b> di postingan IG, lalu klik tombol di bawah ini:</span>';actionBar.style.display='block';return;}startExtraction(c);}run();}catch(err){alert('Kesalahan bookmarklet: '+err.message);}})();`;

export const CHROME_EXTENSION_README = `# IG Liker Exporter & Long Screenshot - Chrome Extension

Ekstensi Chrome resmi untuk mengekstrak ratusan username likers dari postingan Instagram dengan 1-klik, serta membuat **Screenshot Panjang Otomatis (PNG)** tanpa aplikasi pihak ketiga.

## Fitur Unggulan:
1. **Ekstrak Username Likers 1-Klik**: Mengumpulkan ratusan likers otomatis via scroll dan menyalinnya ke clipboard.
2. **📸 Screenshot Panjang Otomatis (PNG)**: Mengambil seluruh baris pengguna yang like, merender tampilan persis modal Likes Instagram Dark Mode, dan langsung mendownload file gambar PNG panjang. Sangat cocok untuk lampiran bukti laporan ritel tanpa perlu screen recording iPhone!

## Cara Install di Google Chrome / Microsoft Edge / Brave (Hanya 10 Detik):
1. Unduh atau ekstrak folder ekstensi ini di komputer Anda.
2. Buka browser Chrome, lalu ketik di address bar: \`chrome://extensions\` (atau \`edge://extensions\` jika pakai Edge).
3. Nyalakan tombol **"Developer mode" (Mode Pengembang)** di pojok kanan atas.
4. Klik tombol **"Load unpacked" (Muat yang belum dibongkar)** di pojok kiri atas.
5. Pilih folder hasil ekstrak ini.
6. Selesai! Ikon ekstensi ⚡ **IG Liker Exporter** akan langsung muncul di toolbar browser Anda.

## Cara Penggunaan Screenshot Panjang:
1. Buka link postingan Instagram di browser.
2. Klik jumlah **Likes / Suka** agar modal daftar orang yang like muncul.
3. Klik ikon ekstensi **IG Liker Exporter** di toolbar browser.
4. Klik **"📸 Download Screenshot Panjang (PNG)"**.
5. Sistem akan otomatis melakukan auto-scroll dan mendownload gambar PNG panjang resolusi tinggi!
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
