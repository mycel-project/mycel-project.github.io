const urlParams = new URLSearchParams(window.location.search);
let selectedInstall = urlParams.get('install') || 'git';
let selectedOs = urlParams.get('os') || (navigator.userAgent.includes('Windows') ? 'win' : 'unix');

function updateURL() {
  const url = new URL(window.location);
  url.searchParams.set('install', selectedInstall);
  url.searchParams.set('os', selectedOs);
  window.history.replaceState({}, '', url);
}

function switchInstallTab(btn, name) {
  selectedInstall = name;
  document.querySelectorAll('#tabs-install .tab-btn').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#install-git, #install-docker, #install-nix').forEach(el => el.hidden = true);
  btn.classList.add('active');
  document.getElementById('install-' + name).hidden = false;
  updateURL();
}

function switchOsTab(btn, os) {
  selectedOs = os;
  document.querySelectorAll('#tabs-os .tab-btn').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#os-win, #os-unix, #run-win, #run-unix').forEach(el => el.hidden = true);
  document.getElementById('os-' + os).hidden = false;
  document.getElementById('run-' + os).hidden = false;
  updateURL();
}

document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.querySelector(`#tabs-install .tab-btn[onclick*="${selectedInstall}"]`);
  if (installBtn) switchInstallTab(installBtn, selectedInstall);

  const osBtn = document.getElementById('os-btn-' + selectedOs);
  if (osBtn) switchOsTab(osBtn, selectedOs);
});
