// Data dan template lengkap untuk Chrome Extension Universal (Instagram & Facebook) Liker Export & Bookmarklet
import JSZip from 'jszip';

export const CHROME_EXTENSION_MANIFEST = `{
  "manifest_version": 3,
  "name": "IG & FB Liker Exporter - Retail Monitoring",
  "version": "2.0.0",
  "description": "Ekstrak otomatis daftar username/akun yang like postingan Instagram & Facebook dalam 1 ekstensi (dilengkapi Saklar Mode IG / FB + Screenshot Panjang).",
  "permissions": ["activeTab", "tabs", "scripting", "clipboardWrite", "storage"],
  "host_permissions": [
    "*://*.instagram.com/*",
    "https://*.instagram.com/*",
    "https://instagram.com/*",
    "*://*.facebook.com/*",
    "https://*.facebook.com/*",
    "https://facebook.com/*",
    "https://web.facebook.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Ekstrak Likers IG & FB",
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
  <title>IG & FB Liker Exporter</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { width: 355px; background: rgb(15, 23, 42); color: rgb(248, 250, 252); padding: 16px; font-size: 13px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgb(51, 65, 85); padding-bottom: 10px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .logo { width: 28px; height: 28px; background: rgb(79, 70, 229); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
    .title { font-size: 14px; font-weight: 700; color: rgb(255, 255, 255); }
    .subtitle { font-size: 10px; color: rgb(148, 163, 184); }
    .switcher { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: rgb(30, 41, 59); padding: 4px; border-radius: 10px; border: 1px solid rgb(51, 65, 85); margin-bottom: 12px; }
    .sw-btn { padding: 7px 8px; border-radius: 7px; border: none; font-size: 11px; font-weight: 700; cursor: pointer; background: transparent; color: rgb(148, 163, 184); transition: all 0.15s; }
    .sw-btn.active-ig { background: rgb(219, 39, 119); color: white; }
    .sw-btn.active-fb { background: rgb(24, 119, 242); color: white; }
    .card { background: rgb(30, 41, 59); border: 1px solid rgb(51, 65, 85); border-radius: 10px; padding: 12px; margin-bottom: 10px; }
    .btn { width: 100%; padding: 10px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
    .btn-primary { background: rgb(79, 70, 229); color: white; }
    .btn-primary.fb-mode { background: rgb(24, 119, 242); color: white; }
    .btn-success { background: rgb(5, 150, 105); color: white; margin-top: 8px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .status { margin-top: 10px; font-size: 11px; padding: 8px; border-radius: 6px; background: rgb(15, 23, 42); border: 1px solid rgb(51, 65, 85); color: rgb(56, 189, 248); min-height: 36px; display: flex; align-items: center; line-height: 1.4; }
    .result-box { margin-top: 10px; display: none; }
    textarea { width: 100%; height: 95px; background: rgb(15, 23, 42); border: 1px solid rgb(71, 85, 105); border-radius: 6px; color: rgb(52, 211, 153); font-family: monospace; font-size: 11px; padding: 8px; resize: none; margin-top: 6px; }
    .badge { background: rgb(49, 46, 129); color: rgb(165, 180, 252); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="logo" id="brand-logo">⚡</div>
      <div>
        <div class="title">Liker Exporter v2.0</div>
        <div class="subtitle">Instagram & Facebook Mode</div>
      </div>
    </div>
    <span class="badge" id="mode-badge">MODE IG</span>
  </div>

  <div class="switcher">
    <button id="mode-ig" class="sw-btn active-ig">📸 Mode Instagram</button>
    <button id="mode-fb" class="sw-btn">👍 Mode Facebook</button>
  </div>

  <div class="card">
    <p id="guide-text" style="font-size: 11px; color: rgb(148, 163, 184); line-height: 1.45; margin-bottom: 10px;">
      1. Buka postingan di Instagram Web.<br>
      2. Klik jumlah <b>Likes/Suka</b> agar popup daftar muncul.<br>
      3. Klik tombol ekstrak di bawah:
    </p>

    <button id="btn-extract" class="btn btn-primary">
      <span id="btn-extract-label">🚀 Ekstrak Likers Instagram</span>
    </button>

    <button id="btn-screenshot" class="btn" style="background: linear-gradient(135deg, rgb(219, 39, 119), rgb(147, 51, 234)); color: white; margin-top: 8px;">
      <span>📸 Download Screenshot Panjang (PNG)</span>
    </button>
    
    <div id="status-box" class="status">
      Status: Siap mengekstrak daftar like sesuai saklar mode aktif.
    </div>

    <div id="result-container" class="result-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
        <span style="font-size: 11px; font-weight: 600; color: rgb(52, 211, 153);" id="count-label">0 Akun Ditemukan</span>
      </div>
      <textarea id="output-text" readonly placeholder="Daftar akun akan muncul di sini..."></textarea>
      
      <button id="btn-copy" class="btn btn-success">
        <span>📋 Salin ke Clipboard</span>
      </button>
    </div>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;

export const CHROME_EXTENSION_POPUP_JS = `document.addEventListener('DOMContentLoaded', async () => {
  const btnModeIg = document.getElementById('mode-ig');
  const btnModeFb = document.getElementById('mode-fb');
  const modeBadge = document.getElementById('mode-badge');
  const guideText = document.getElementById('guide-text');
  const btnExtract = document.getElementById('btn-extract');
  const btnExtractLabel = document.getElementById('btn-extract-label');
  const btnCopy = document.getElementById('btn-copy');
  const btnScreenshot = document.getElementById('btn-screenshot');
  const statusBox = document.getElementById('status-box');
  const resultContainer = document.getElementById('result-container');
  const outputText = document.getElementById('output-text');
  const countLabel = document.getElementById('count-label');

  let currentPlatform = 'instagram';

  function applyPlatformUI(platform) {
    currentPlatform = platform;
    if (platform === 'facebook') {
      btnModeFb.className = 'sw-btn active-fb';
      btnModeIg.className = 'sw-btn';
      modeBadge.innerText = 'MODE FB';
      modeBadge.style.background = 'rgb(30, 58, 138)';
      modeBadge.style.color = 'rgb(147, 197, 253)';
      btnExtract.className = 'btn btn-primary fb-mode';
      btnExtractLabel.innerText = '🚀 Ekstrak Likers Facebook';
      guideText.innerHTML = '1. Buka postingan di Facebook Web.<br>2. Klik angka/ikon <b>Tanggapan (👍❤️ Like)</b> hingga popup daftar orang muncul.<br>3. Klik tombol ekstrak di bawah:';
    } else {
      btnModeIg.className = 'sw-btn active-ig';
      btnModeFb.className = 'sw-btn';
      modeBadge.innerText = 'MODE IG';
      modeBadge.style.background = 'rgb(131, 24, 67)';
      modeBadge.style.color = 'rgb(249, 168, 212)';
      btnExtract.className = 'btn btn-primary';
      btnExtractLabel.innerText = '🚀 Ekstrak Likers Instagram';
      guideText.innerHTML = '1. Buka postingan di Instagram Web.<br>2. Klik jumlah <b>Likes/Suka</b> agar popup daftar muncul.<br>3. Klik tombol ekstrak di bawah:';
    }
  }

  // Auto-detect active browser tab URL
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.url && activeTab.url.includes('facebook.com')) {
      applyPlatformUI('facebook');
    } else {
      applyPlatformUI('instagram');
    }
  } catch (e) {
    applyPlatformUI('instagram');
  }

  btnModeIg.addEventListener('click', () => applyPlatformUI('instagram'));
  btnModeFb.addEventListener('click', () => applyPlatformUI('facebook'));

  btnExtract.addEventListener('click', async () => {
    btnExtract.disabled = true;
    statusBox.innerText = '⏳ Memeriksa tab aktif...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        statusBox.innerHTML = '⚠️ Tab aktif tidak ditemukan.';
        btnExtract.disabled = false;
        return;
      }

      if (currentPlatform === 'facebook' && tab.url && !tab.url.includes('facebook.com')) {
        statusBox.innerHTML = '⚠️ Buka halaman postingan Facebook terlebih dahulu (atau pindahkan saklar ke Mode Instagram)!';
        btnExtract.disabled = false;
        return;
      }
      if (currentPlatform === 'instagram' && tab.url && !tab.url.includes('instagram.com')) {
        statusBox.innerHTML = '⚠️ Buka halaman postingan Instagram terlebih dahulu (atau pindahkan saklar ke Mode Facebook)!';
        btnExtract.disabled = false;
        return;
      }

      statusBox.innerHTML = '🚀 Sedang auto-scroll & mengekstrak daftar akun yang like...';

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: currentPlatform === 'facebook' ? inPageFacebookExtractor : inPageInstagramExtractor
      });

      btnExtract.disabled = false;

      if (!results || !results[0] || !results[0].result) {
        statusBox.innerHTML = '⚠️ Gagal mengambil data. Pastikan popup daftar Like/Tanggapan sudah terbuka!';
        return;
      }

      const res = results[0].result;
      if (res.usernames && res.usernames.length > 0) {
        const joined = res.usernames.join('\\n');
        outputText.value = joined;
        countLabel.innerText = '✅ ' + res.usernames.length + ' Akun Berhasil Diekstrak!';
        statusBox.innerHTML = '✅ Sukses! Ditemukan <b>' + res.usernames.length + '</b> akun dan otomatis disalin ke Clipboard.';
        resultContainer.style.display = 'block';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(joined).catch(() => {});
        }
      } else if (res.error === 'MODAL_NOT_OPEN') {
        statusBox.innerHTML = '⚠️ <b>Popup Like/Tanggapan belum dibuka!</b> Klik angka Like/👍 pada postingan dulu, lalu klik tombol ini lagi.';
      } else {
        statusBox.innerHTML = '⚠️ Tidak ada akun terdeteksi. Pastikan popup daftar orang yang like terbuka di layar.';
      }
    } catch (err) {
      btnExtract.disabled = false;
      statusBox.innerHTML = '⚠️ Kesalahan: ' + (err.message || err);
    }
  });

  btnCopy.addEventListener('click', () => {
    if (outputText.value) {
      navigator.clipboard.writeText(outputText.value).then(() => {
        btnCopy.innerText = '✅ Tersalin!';
        setTimeout(() => { btnCopy.innerText = '📋 Salin ke Clipboard'; }, 2000);
      });
    }
  });

  if (btnScreenshot) {
    btnScreenshot.addEventListener('click', async () => {
      btnScreenshot.disabled = true;
      statusBox.innerText = '⏳ Menyiapkan auto-scroll & screenshot panjang...';
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
          btnScreenshot.disabled = false;
          return;
        }
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: currentPlatform === 'facebook' ? inPageFacebookLongScreenshot : inPageInstagramLongScreenshot
        });
        btnScreenshot.disabled = false;
        const res = results && results[0] ? results[0].result : null;
        if (res && res.success) {
          statusBox.innerHTML = '✅ Sukses! Screenshot panjang berisi <b>' + res.count + '</b> akun otomatis didownload!';
        } else {
          statusBox.innerHTML = '⚠️ Pastikan popup daftar Like/Tanggapan sudah terbuka di layar terlebih dahulu!';
        }
      } catch (err) {
        btnScreenshot.disabled = false;
        statusBox.innerHTML = '⚠️ Kesalahan: ' + (err.message || err);
      }
    });
  }
});

// ================= INSTAGRAM EXTRACTOR =================
async function inPageInstagramExtractor() {
  var dialog = document.querySelector('div[role="dialog"] div[style*="overflow"]')
            || document.querySelector('div[role="dialog"] div[style*="overflow-y"]')
            || document.querySelector('div[aria-modal="true"] div[style*="overflow"]')
            || document.querySelector('div[role="dialog"]')
            || document.querySelector('div[aria-modal="true"]');

  if (!dialog) {
    return { error: 'MODAL_NOT_OPEN', usernames: [] };
  }

  var allUsernames = new Set();
  var lastHeight = 0;
  var unchangedCount = 0;
  var step = 0;

  while (unchangedCount < 5 && step < 65) {
    var links = Array.from(document.querySelectorAll('div[role="dialog"] a, div[aria-modal="true"] a'))
      .map(function(a) { return a.getAttribute('href'); })
      .filter(function(h) {
        return h && typeof h === 'string' && h.startsWith('/')
          && !h.includes('/explore/') && !h.includes('/direct/')
          && !h.includes('/stories/') && !h.includes('/reels/') && !h.includes('/p/');
      })
      .map(function(h) { return h.replaceAll('/', '').trim().toLowerCase(); })
      .filter(function(u) { return u && u.length >= 2 && u.length <= 32; });

    links.forEach(function(u) { allUsernames.add(u); });

    dialog.scrollTop += 550;
    try { dialog.dispatchEvent(new Event('scroll', { bubbles: true })); } catch(e) {}
    await new Promise(function(r) { setTimeout(r, 750); });

    var newHeight = dialog.scrollTop;
    if (newHeight === lastHeight) unchangedCount++;
    else { unchangedCount = 0; lastHeight = newHeight; }
    step++;
  }

  return { usernames: Array.from(allUsernames) };
}

// ================= FACEBOOK EXTRACTOR =================
async function inPageFacebookExtractor() {
  var dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
  if (dialogs.length === 0) {
    return { error: 'MODAL_NOT_OPEN', usernames: [] };
  }

  // Pilih dialog paling atas (Reactions dialog berada di urutan terakhir di DOM Facebook)
  var targetDialog = dialogs[dialogs.length - 1];

  function findFbScroller(root) {
    var best = null;
    var maxScrollable = 0;
    var els = Array.from(root.querySelectorAll('div'));
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var st = window.getComputedStyle(el);
      if ((st.overflowY === 'auto' || st.overflowY === 'scroll') && el.clientHeight > 80) {
        var diff = el.scrollHeight - el.clientHeight;
        if (diff >= maxScrollable) {
          maxScrollable = diff;
          best = el;
        }
      }
    }
    return best || root;
  }

  var noiseSet = {
    'semua':1,'all':1,'tambah jadi teman':1,'tambah teman':1,'add friend':1,
    'ikuti':1,'follow':1,'mengikuti':1,'following':1,'kirim pesan':1,'message':1,
    'teman':1,'friends':1,'tutup':1,'close':1,'batalkan permintaan':1,'cancel request':1,
    'lainnya':1,'more':1,'lihat selengkapnya':1,'see more':1,'suka':1,'super':1,'peduli':1
  };

  var foundMap = new Map();
  var lastScrollTop = -1;
  var unchangedCount = 0;
  var step = 0;

  while (unchangedCount < 6 && step < 75) {
    var scroller = findFbScroller(targetDialog);
    var anchors = Array.from(targetDialog.querySelectorAll('a[href]'));

    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#')) continue;
      if (href.includes('/groups/') || href.includes('/hashtag/') || href.includes('/watch/') ||
          href.includes('/photo') || href.includes('/videos/') || href.includes('/stories/') ||
          href.includes('/events/') || href.includes('comment_id=') || href.includes('/friends/')) {
        continue;
      }

      var rawTxt = (a.innerText || a.textContent || '').replace(/[\\r\\n]+/g, ' ').replace(/\\s+/g, ' ').trim();
      if (!rawTxt || rawTxt.length < 2 || rawTxt.length > 65) continue;
      var low = rawTxt.toLowerCase();
      if (noiseSet[low]) continue;
      if (/^\\d+\\s*(teman bersama|mutual friend)/i.test(low)) continue;
      if (/^\\d+([.,]\\d+)?\\s*(rb|jt|k|m)?$/i.test(low)) continue;

      var slug = '';
      try {
        var fullUrl = href.startsWith('http') ? href : ('https://www.facebook.com' + (href.startsWith('/') ? '' : '/') + href);
        var uObj = new URL(fullUrl);
        if (uObj.pathname.includes('profile.php')) {
          var pid = uObj.searchParams.get('id');
          if (pid) slug = 'id:' + pid;
        } else {
          var segs = uObj.pathname.split('/').filter(Boolean);
          if (segs[0] === 'people' && segs[2]) {
            slug = 'id:' + segs[2];
          } else if (segs[0] && segs[0] !== 'people') {
            slug = segs[0].toLowerCase();
          }
        }
      } catch(e) {}

      var key = slug || low;
      if (!foundMap.has(key)) {
        var entry = (slug && !slug.startsWith('id:') && slug !== low.replace(/\\s+/g, ''))
          ? (rawTxt + ' [' + slug + ']')
          : rawTxt;
        foundMap.set(key, entry);
      }
    }

    scroller.scrollTop += 550;
    try { scroller.dispatchEvent(new Event('scroll', { bubbles: true })); } catch(e) {}
    await new Promise(function(r) { setTimeout(r, 800); });

    if (scroller.scrollTop === lastScrollTop) {
      unchangedCount++;
    } else {
      unchangedCount = 0;
      lastScrollTop = scroller.scrollTop;
    }
    step++;
  }

  return { usernames: Array.from(foundMap.values()) };
}

async function inPageInstagramLongScreenshot() {
  var res = await inPageInstagramExtractor();
  if (!res.usernames || res.usernames.length === 0) return { error: 'MODAL_NOT_OPEN' };
  var list = res.usernames;
  var width = 800, rowH = 110, headerH = 100, footerH = 80;
  var totalHeight = headerH + (list.length * rowH) + footerH;
  var canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = totalHeight;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(38,38,38)'; ctx.fillRect(0, 0, width, totalHeight);
  ctx.fillStyle = 'rgb(255,255,255)'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Likes (Instagram)', width / 2, 60);
  var colors = ['rgb(225,48,108)', 'rgb(193,53,132)', 'rgb(131,58,180)', 'rgb(64,93,230)'];
  for (var i = 0; i < list.length; i++) {
    var u = list[i], y = headerH + (i * rowH);
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath(); ctx.arc(65, y + 55, 36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgb(255,255,255)'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(u.slice(0, 2).toUpperCase(), 65, y + 64);
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgb(245,245,245)'; ctx.font = 'bold 27px sans-serif';
    ctx.fillText(u, 125, y + 62);
  }
  var dl = document.createElement('a');
  dl.download = 'screenshot-panjang-like-ig-' + Date.now() + '.png';
  dl.href = canvas.toDataURL('image/png');
  document.body.appendChild(dl); dl.click(); document.body.removeChild(dl);
  return { success: true, count: list.length };
}

async function inPageFacebookLongScreenshot() {
  var res = await inPageFacebookExtractor();
  if (!res.usernames || res.usernames.length === 0) return { error: 'MODAL_NOT_OPEN' };
  var list = res.usernames;
  var width = 800, rowH = 110, headerH = 100, footerH = 80;
  var totalHeight = headerH + (list.length * rowH) + footerH;
  var canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = totalHeight;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(36,37,38)'; ctx.fillRect(0, 0, width, totalHeight);
  ctx.fillStyle = 'rgb(255,255,255)'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Semua Tanggapan • Facebook (' + list.length + ')', width / 2, 60);
  for (var i = 0; i < list.length; i++) {
    var raw = list[i].replace(/\\s*\\[.*?\\]$/, '');
    var y = headerH + (i * rowH);
    ctx.fillStyle = 'rgb(24,119,242)';
    ctx.beginPath(); ctx.arc(65, y + 55, 36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgb(255,255,255)'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(raw.slice(0, 2).toUpperCase(), 65, y + 64);
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgb(228,230,235)'; ctx.font = 'bold 26px sans-serif';
    ctx.fillText(raw, 125, y + 62);
  }
  var dl = document.createElement('a');
  dl.download = 'screenshot-panjang-like-fb-' + Date.now() + '.png';
  dl.href = canvas.toDataURL('image/png');
  document.body.appendChild(dl); dl.click(); document.body.removeChild(dl);
  return { success: true, count: list.length };
}`;

export const CHROME_EXTENSION_CONTENT_JS = `// Content script for IG & FB Liker Exporter v2.0
console.log('IG & FB Liker Exporter v2.0 active.');`;

// INSTAGRAM BOOKMARKLET (100% free of '#' characters so browsers never truncate URL)
export const BOOKMARKLET_CODE = `javascript:(function(){try{if(!location.hostname.includes('instagram.com')){alert('Silakan buka postingan di Instagram Web (instagram.com) terlebih dahulu, atau gunakan Bookmarklet Mode Facebook jika sedang di Facebook!');return;}var old=document.getElementById('ig-liker-exporter-hud');if(old){old.remove();}var hud=document.createElement('div');hud.id='ig-liker-exporter-hud';hud.style.cssText='position:fixed;top:20px;right:20px;z-index:999999999;width:350px;background:rgb(15,23,42);color:rgb(248,250,252);border-radius:14px;border:2px solid rgb(219,39,119);box-shadow:0 20px 45px rgba(0,0,0,0.8);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:16px;box-sizing:border-box;';hud.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgb(51,65,85);padding-bottom:10px;margin-bottom:10px;"><div style="display:flex;align-items:center;gap:8px;"><div style="background:rgb(219,39,119);color:rgb(255,255,255);width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">⚡</div><div><div style="font-weight:bold;font-size:13px;color:rgb(255,255,255);">IG Liker Exporter</div><div style="font-size:10px;color:rgb(148,163,184);">Mode Instagram • Auto-Scroll</div></div></div><button id="ig-close-hud" style="background:none;border:none;color:rgb(148,163,184);cursor:pointer;font-size:20px;line-height:1;padding:2px 6px;">&times;</button></div><div id="ig-status-text" style="font-size:12px;color:rgb(56,189,248);margin-bottom:10px;background:rgb(30,41,59);padding:8px 10px;border-radius:8px;border:1px solid rgb(51,65,85);line-height:1.4;">⏳ Memeriksa popup Like Instagram...</div><div id="ig-result-box" style="display:none;"><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:bold;color:rgb(52,211,153);margin-bottom:6px;"><span id="ig-count-text">0 Username</span><span>Siap di-Paste</span></div><textarea id="ig-usernames-area" style="width:100%;height:100px;background:rgb(2,6,23);color:rgb(74,222,128);font-family:monospace;font-size:11px;padding:8px;border-radius:8px;border:1px solid rgb(51,65,85);box-sizing:border-box;resize:none;" readonly></textarea><div style="display:flex;gap:6px;margin-top:10px;"><button id="ig-btn-copy-hud" style="flex:1;background:rgb(5,150,105);color:rgb(255,255,255);border:none;border-radius:8px;padding:8px 6px;font-weight:bold;font-size:11px;cursor:pointer;">📋 Salin Teks</button><button id="ig-btn-ss-hud" style="flex:1.2;background:linear-gradient(135deg,rgb(219,39,119),rgb(147,51,234));color:rgb(255,255,255);border:none;border-radius:8px;padding:8px 6px;font-weight:bold;font-size:11px;cursor:pointer;">📸 Screenshot Panjang</button></div></div><div id="ig-loading-bar" style="height:4px;background:rgb(30,41,59);border-radius:2px;overflow:hidden;margin-top:8px;"><div id="ig-progress-inner" style="height:100%;background:rgb(219,39,119);width:20%;transition:width 0.3s;"></div></div><div id="ig-action-bar" style="margin-top:10px;display:none;"><button id="ig-retry-btn" style="width:100%;background:rgb(219,39,119);color:rgb(255,255,255);border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:bold;cursor:pointer;">🔄 Mulai Ekstrak Lagi</button></div>';document.body.appendChild(hud);document.getElementById('ig-close-hud').onclick=function(){hud.remove();};var statusEl=document.getElementById('ig-status-text'),resultBox=document.getElementById('ig-result-box'),countText=document.getElementById('ig-count-text'),area=document.getElementById('ig-usernames-area'),btnCopy=document.getElementById('ig-btn-copy-hud'),btnSS=document.getElementById('ig-btn-ss-hud'),progress=document.getElementById('ig-progress-inner'),actionBar=document.getElementById('ig-action-bar'),retryBtn=document.getElementById('ig-retry-btn');var usernamesSet=new Set(),lastHeight=0,unchangedCount=0,step=0;function copyTextFallback(text){try{var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.top='-9999px';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);return true;}catch(e){return false;}}function findContainer(){var dialog=document.querySelector('div[role=\"dialog\"] div[style*=\"overflow\"]')||document.querySelector('div[role=\"dialog\"] div[style*=\"overflow-y\"]')||document.querySelector('div[aria-modal=\"true\"] div[style*=\"overflow\"]')||document.querySelector('div[role=\"dialog\"]')||document.querySelector('div[aria-modal=\"true\"]');return dialog;}function extractCurrent(){var links=Array.from(document.querySelectorAll('div[role=\"dialog\"] a, div[aria-modal=\"true\"] a'));links.forEach(function(a){var h=a.getAttribute('href');if(h&&typeof h==='string'&&h.startsWith('/')&&!h.includes('/explore/')&&!h.includes('/direct/')&&!h.includes('/stories/')&&!h.includes('/reels/')&&!h.includes('/p/')){var clean=h.replaceAll('/','').trim().toLowerCase();if(clean&&clean.length>=2&&clean.length<=32){usernamesSet.add(clean);}}});}function downloadLongScreenshot(list){var width=800,rowH=110,headerH=100,footerH=80,totalHeight=headerH+(list.length*rowH)+footerH;var canvas=document.createElement('canvas');canvas.width=width;canvas.height=totalHeight;var ctx=canvas.getContext('2d');ctx.fillStyle='rgb(38,38,38)';ctx.fillRect(0,0,width,totalHeight);ctx.fillStyle='rgb(255,255,255)';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('Likes',width/2,60);var colors=['rgb(225,48,108)','rgb(193,53,132)','rgb(131,58,180)','rgb(64,93,230)'];for(var i=0;i<list.length;i++){var u=list[i];var y=headerH+(i*rowH);ctx.fillStyle=colors[i%colors.length];ctx.beginPath();ctx.arc(65,y+55,36,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgb(255,255,255)';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText(u.slice(0,2).toUpperCase(),65,y+64);ctx.textAlign='left';ctx.fillStyle='rgb(245,245,245)';ctx.font='bold 28px sans-serif';ctx.fillText(u,125,y+62);}var a=document.createElement('a');a.download='screenshot-panjang-likers-ig-'+Date.now()+'.png';a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();document.body.removeChild(a);}function finishExtraction(){progress.style.width='100%';var list=Array.from(usernamesSet);var text=list.join('\\n');if(list.length===0){statusEl.innerHTML='⚠️ Pastikan popup daftar Likes Instagram sudah terbuka di layar, lalu klik Mulai Ekstrak Lagi.';actionBar.style.display='block';return;}statusEl.innerHTML='✅ Selesai! Ditemukan <b>'+list.length+'</b> username IG.';resultBox.style.display='block';actionBar.style.display='block';countText.innerText=list.length+' Username IG';area.value=text;copyTextFallback(text);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).catch(function(){});}btnCopy.onclick=function(){copyTextFallback(text);btnCopy.innerText='✅ Disalin!';setTimeout(function(){btnCopy.innerText='📋 Salin Teks';},2000);};btnSS.onclick=function(){downloadLongScreenshot(list);};}function startExtraction(container){function doScrollLoop(){extractCurrent();step++;var percent=Math.min(95,Math.floor((step/35)*100));progress.style.width=percent+'%';statusEl.innerHTML='🚀 Mengumpulkan... (<b>'+usernamesSet.size+'</b> username)';container.scrollTop+=500;try{container.dispatchEvent(new Event('scroll',{bubbles:true}));}catch(e){}setTimeout(function(){var newHeight=container.scrollTop;if(newHeight===lastHeight){unchangedCount++;}else{unchangedCount=0;lastHeight=newHeight;}if(unchangedCount>=5||step>=60){finishExtraction();}else{doScrollLoop();}},800);}doScrollLoop();}retryBtn.onclick=function(){usernamesSet.clear();step=0;unchangedCount=0;lastHeight=0;resultBox.style.display='none';actionBar.style.display='none';run();};function run(){var c=findContainer();if(!c){statusEl.innerHTML='⚠️ Popup Likes IG belum terbuka! Klik angka Likes pada postingan dulu, lalu klik tombol di bawah.';actionBar.style.display='block';return;}startExtraction(c);}run();}catch(err){alert('Kesalahan bookmarklet: '+err.message);}})();`;

// FACEBOOK BOOKMARKLET (100% free of '#' characters so browsers NEVER truncate URL, specifically built for Facebook Reactions dialog!)
export const FACEBOOK_BOOKMARKLET_CODE = `javascript:(function(){try{if(!location.hostname.includes('facebook.com')){alert('Silakan buka postingan di Facebook Web (facebook.com) terlebih dahulu, lalu klik angka Tanggapan/Like agar daftar orang muncul!');return;}var old=document.getElementById('fb-liker-exporter-hud');if(old){old.remove();}var hud=document.createElement('div');hud.id='fb-liker-exporter-hud';hud.style.cssText='position:fixed;top:20px;right:20px;z-index:999999999;width:360px;background:rgb(15,23,42);color:rgb(248,250,252);border-radius:14px;border:2px solid rgb(24,119,242);box-shadow:0 20px 45px rgba(0,0,0,0.85);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:16px;box-sizing:border-box;';hud.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgb(51,65,85);padding-bottom:10px;margin-bottom:10px;"><div style="display:flex;align-items:center;gap:8px;"><div style="background:rgb(24,119,242);color:rgb(255,255,255);width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">👍</div><div><div style="font-weight:bold;font-size:13px;color:rgb(255,255,255);">FB Liker Exporter</div><div style="font-size:10px;color:rgb(147,197,253);">Mode Facebook • Auto-Scroll Reactions</div></div></div><button id="fb-close-hud" style="background:none;border:none;color:rgb(148,163,184);cursor:pointer;font-size:20px;line-height:1;padding:2px 6px;">&times;</button></div><div id="fb-status-text" style="font-size:12px;color:rgb(96,165,250);margin-bottom:10px;background:rgb(30,41,59);padding:8px 10px;border-radius:8px;border:1px solid rgb(51,65,85);line-height:1.4;">⏳ Memeriksa popup Tanggapan/Like Facebook...</div><div id="fb-result-box" style="display:none;"><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:bold;color:rgb(52,211,153);margin-bottom:6px;"><span id="fb-count-text">0 Akun FB</span><span>Siap di-Paste ke Mode FB</span></div><textarea id="fb-usernames-area" style="width:100%;height:105px;background:rgb(2,6,23);color:rgb(147,197,253);font-family:monospace;font-size:11px;padding:8px;border-radius:8px;border:1px solid rgb(51,65,85);box-sizing:border-box;resize:none;" readonly></textarea><div style="display:flex;gap:6px;margin-top:10px;"><button id="fb-btn-copy-hud" style="flex:1;background:rgb(5,150,105);color:rgb(255,255,255);border:none;border-radius:8px;padding:8px 6px;font-weight:bold;font-size:11px;cursor:pointer;">📋 Salin Daftar FB</button><button id="fb-btn-ss-hud" style="flex:1.2;background:rgb(24,119,242);color:rgb(255,255,255);border:none;border-radius:8px;padding:8px 6px;font-weight:bold;font-size:11px;cursor:pointer;">📸 Screenshot Panjang</button></div></div><div id="fb-loading-bar" style="height:4px;background:rgb(30,41,59);border-radius:2px;overflow:hidden;margin-top:8px;"><div id="fb-progress-inner" style="height:100%;background:rgb(24,119,242);width:20%;transition:width 0.3s;"></div></div><div id="fb-action-bar" style="margin-top:10px;display:none;"><button id="fb-retry-btn" style="width:100%;background:rgb(24,119,242);color:rgb(255,255,255);border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:bold;cursor:pointer;">🔄 Mulai Ekstrak Ulang</button></div>';document.body.appendChild(hud);document.getElementById('fb-close-hud').onclick=function(){hud.remove();};var statusEl=document.getElementById('fb-status-text'),resultBox=document.getElementById('fb-result-box'),countText=document.getElementById('fb-count-text'),area=document.getElementById('fb-usernames-area'),btnCopy=document.getElementById('fb-btn-copy-hud'),btnSS=document.getElementById('fb-btn-ss-hud'),progress=document.getElementById('fb-progress-inner'),actionBar=document.getElementById('fb-action-bar'),retryBtn=document.getElementById('fb-retry-btn');var foundMap=new Map(),lastTop=-1,unchangedCount=0,step=0;var noise={'semua':1,'all':1,'tambah jadi teman':1,'tambah teman':1,'add friend':1,'ikuti':1,'follow':1,'mengikuti':1,'following':1,'kirim pesan':1,'message':1,'teman':1,'friends':1,'tutup':1,'close':1,'batalkan permintaan':1,'cancel request':1,'lainnya':1,'more':1,'lihat selengkapnya':1,'see more':1,'suka':1,'super':1,'peduli':1};function copyTextFallback(text){try{var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.top='-9999px';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);return true;}catch(e){return false;}}function getTopDialog(){var ds=Array.from(document.querySelectorAll('div[role=\"dialog\"]'));return ds.length>0?ds[ds.length-1]:null;}function getScroller(dlg){var best=null,maxDiff=0,divs=Array.from(dlg.querySelectorAll('div'));for(var i=0;i<divs.length;i++){var el=divs[i],st=window.getComputedStyle(el);if((st.overflowY==='auto'||st.overflowY==='scroll')&&el.clientHeight>80){var d=el.scrollHeight-el.clientHeight;if(d>=maxDiff){maxDiff=d;best=el;}}}return best||dlg;}function extractFbBatch(dlg){var links=Array.from(dlg.querySelectorAll('a[href]'));for(var i=0;i<links.length;i++){var a=links[i],href=a.getAttribute('href')||'';if(!href||href.includes('/groups/')||href.includes('/hashtag/')||href.includes('/watch/')||href.includes('/photo')||href.includes('/videos/')||href.includes('/stories/')||href.includes('/events/')||href.includes('comment_id=')||href.includes('/friends/')){continue;}var txt=(a.innerText||a.textContent||'').replace(/[\\r\\n]+/g,' ').replace(/\\s+/g,' ').trim();if(!txt||txt.length<2||txt.length>65){continue;}var low=txt.toLowerCase();if(noise[low]){continue;}if(/^\\d+\\s*(teman bersama|mutual friend)/i.test(low)){continue;}if(/^\\d+([.,]\\d+)?\\s*(rb|jt|k|m)?$/i.test(low)){continue;}var slug='';try{var full=href.startsWith('http')?href:('https://www.facebook.com'+(href.startsWith('/')?'':'/')+href);var uo=new URL(full);if(uo.pathname.includes('profile.php')){var pid=uo.searchParams.get('id');if(pid)slug='id:'+pid;}else{var segs=uo.pathname.split('/').filter(Boolean);if(segs[0]==='people'&&segs[2]){slug='id:'+segs[2];}else if(segs[0]&&segs[0]!=='people'){slug=segs[0].toLowerCase();}}}catch(e){}var k=slug||low;if(!foundMap.has(k)){var val=(slug&&!slug.startsWith('id:')&&slug!==low.replace(/\\s+/g,''))?(txt+' ['+slug+']'):txt;foundMap.set(k,val);}}}function downloadFbSS(list){var width=800,rowH=110,headerH=100,footerH=80,totalHeight=headerH+(list.length*rowH)+footerH;var canvas=document.createElement('canvas');canvas.width=width;canvas.height=totalHeight;var ctx=canvas.getContext('2d');ctx.fillStyle='rgb(36,37,38)';ctx.fillRect(0,0,width,totalHeight);ctx.fillStyle='rgb(255,255,255)';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText('Semua Tanggapan • Facebook ('+list.length+')',width/2,60);for(var i=0;i<list.length;i++){var clean=list[i].replace(/\\s*\\[.*?\\]$/,'');var y=headerH+(i*rowH);ctx.fillStyle='rgb(24,119,242)';ctx.beginPath();ctx.arc(65,y+55,36,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgb(255,255,255)';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText(clean.slice(0,2).toUpperCase(),65,y+64);ctx.textAlign='left';ctx.fillStyle='rgb(228,230,235)';ctx.font='bold 26px sans-serif';ctx.fillText(clean,125,y+62);}var dl=document.createElement('a');dl.download='screenshot-panjang-like-fb-'+Date.now()+'.png';dl.href=canvas.toDataURL('image/png');document.body.appendChild(dl);dl.click();document.body.removeChild(dl);}function finishFb(){progress.style.width='100%';var list=Array.from(foundMap.values());var text=list.join('\\n');if(list.length===0){statusEl.innerHTML='⚠️ Belum ada nama akun FB terdeteksi. Pastikan Anda sudah klik angka/ikon Like (👍❤️) pada postingan hingga jendela daftar orang yang menanggapi terbuka!';actionBar.style.display='block';return;}statusEl.innerHTML='✅ Selesai! Ditemukan <b>'+list.length+'</b> akun Facebook.';resultBox.style.display='block';actionBar.style.display='block';countText.innerText=list.length+' Akun FB Terdeteksi';area.value=text;copyTextFallback(text);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).catch(function(){});}btnCopy.onclick=function(){copyTextFallback(text);btnCopy.innerText='✅ Tersalin!';setTimeout(function(){btnCopy.innerText='📋 Salin Daftar FB';},2000);};btnSS.onclick=function(){downloadFbSS(list);};}function startFbLoop(){var dlg=getTopDialog();if(!dlg){statusEl.innerHTML='⚠️ Popup Tanggapan/Like Facebook belum dibuka! Klik ikon/angka 👍 pada postingan FB dulu, lalu klik tombol di bawah.';actionBar.style.display='block';return;}function loop(){var activeDlg=getTopDialog()||dlg;extractFbBatch(activeDlg);var sc=getScroller(activeDlg);step++;progress.style.width=Math.min(95,Math.floor((step/40)*100))+'%';statusEl.innerHTML='🚀 Mengumpulkan nama akun FB... (<b>'+foundMap.size+'</b> akun)';sc.scrollTop+=550;try{sc.dispatchEvent(new Event('scroll',{bubbles:true}));}catch(e){}setTimeout(function(){if(sc.scrollTop===lastTop){unchangedCount++;}else{unchangedCount=0;lastTop=sc.scrollTop;}if(unchangedCount>=6||step>=75){finishFb();}else{loop();}},800);}loop();}retryBtn.onclick=function(){foundMap.clear();step=0;unchangedCount=0;lastTop=-1;resultBox.style.display='none';actionBar.style.display='none';startFbLoop();};startFbLoop();}catch(err){alert('Kesalahan bookmarklet FB: '+err.message);}})();`;

export const CHROME_EXTENSION_README = `# IG & FB Liker Exporter v2.0 (Universal Mode) - Chrome Extension

Ekstensi Chrome resmi untuk mengekstrak ratusan akun yang me-like postingan **Instagram** maupun **Facebook** hanya dalam 1 ekstensi (dilengkapi Saklar Mode IG / FB otomatis + Screenshot Panjang PNG).

## Fitur Unggulan v2.0:
1. **Saklar Mode Instagram & Facebook Otomatis**: Mendeteksi otomatis apakah Anda sedang membuka tab Instagram atau Facebook, dan dapat diganti kapan saja lewat saklar di dalam popup ekstensi.
2. **Ekstrak Akun Like 1-Klik**: Auto-scroll dialog Likes (IG) maupun dialog Semua Tanggapan / Reactions (FB) hingga baris paling bawah dan menyalin ke Clipboard.
3. **📸 Screenshot Panjang Otomatis (PNG)**: Membuat bukti screenshot panjang tanpa perlu screen recording HP.

## Cara Install di Google Chrome / Microsoft Edge / Brave:
1. Ekstrak file ZIP ini ke dalam satu folder di komputer Anda.
2. Buka \`chrome://extensions\` (atau \`edge://extensions\`).
3. Nyalakan **Developer mode (Mode Pengembang)** di pojok kanan atas.
4. Klik **Load unpacked (Muat yang belum dibongkar)** dan pilih folder hasil ekstrak tadi.
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
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, 128, 128, 28);
      } else {
        ctx.rect(0, 0, 128, 128);
      }
      ctx.fill();

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

  zip.file('manifest.json', CHROME_EXTENSION_MANIFEST);
  zip.file('popup.html', CHROME_EXTENSION_POPUP_HTML);
  zip.file('popup.js', CHROME_EXTENSION_POPUP_JS);
  zip.file('content.js', CHROME_EXTENSION_CONTENT_JS);
  zip.file('README.md', CHROME_EXTENSION_README);

  const iconBlob = await generateExtensionIconBlob();
  if (iconBlob && iconBlob.size > 0) {
    zip.file('icon.png', iconBlob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'IG-FB-Liker-Exporter-v2-Chrome-Extension.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
