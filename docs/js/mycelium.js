if (new URLSearchParams(window.location.search).get('focus') === 'download') {
  const target = document.getElementById('main-download');
  if (target) target.classList.add('pulse-highlight');
}

function detectPlatform() {
  const ua = navigator.userAgent;
  if (ua.includes('Android')) return 'android';
  if (ua.includes('Win')) return 'windows';
  if (ua.includes('Linux')) return 'linux';
  if (ua.includes('Mac')) return 'mac';
  return null;
}

function findAssetForPlatform(assets, platform) {
  return assets.find(a => {
    const n = a.name.toLowerCase();
    if (platform === 'android') return n.endsWith('.apk');
    if (platform === 'windows') return n.endsWith('.exe') || n.includes('windows');
    if (platform === 'linux') return n.endsWith('.appimage') || n.endsWith('.deb') || n.includes('linux');
    if (platform === 'mac') return n.endsWith('.dmg') || n.includes('macos');
    return false;
  });
}

async function setupDownloadBtn() {
  const btn = document.getElementById('main-download');
  if (!btn) return;

  const platform = detectPlatform();
  
  try {
    const res = await fetch('https://api.github.com/repos/mycel-project/mycelium/releases?per_page=10');
    const releases = await res.json();
    const stable = releases.find(r => !r.prerelease && !r.draft);
    
    if (!stable) throw new Error('no release');

    const asset = platform ? findAssetForPlatform(stable.assets, platform) : null;

    if (asset) {
      btn.href = asset.browser_download_url;
      btn.textContent = `Download Mycelium for ${platformLabel(platform)} (${stable.tag_name})`;
    } else {
      btn.href = 'download.html';
      btn.textContent = `Download Mycelium ${stable.tag_name}`;
    }
  } catch {
    btn.href = 'download.html';
    btn.textContent = 'Download Mycelium';
  }
}

setupDownloadBtn();


const urlParams = new URLSearchParams(window.location.search);
let selectedPlatform = urlParams.get('platform') || detectPlatform() || 'linux';

function updateURL() {
  const url = new URL(window.location);
  url.searchParams.set('platform', selectedPlatform);
  window.history.replaceState({}, '', url);
}

function switchPlatformTab(btn, name) {
  selectedPlatform = name;
  document.querySelectorAll('#tabs-platform .tab-btn').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#install-linux, #install-windows, #install-android, #install-mac').forEach(el => el.hidden = true);
  btn.classList.add('active');
  document.getElementById('install-' + name).hidden = false;
  updateURL();
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('plat-btn-' + selectedPlatform);
  if (btn) switchPlatformTab(btn, selectedPlatform);
  setupDownloadBtn();
});
