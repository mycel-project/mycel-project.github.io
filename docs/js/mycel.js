function switchInstallTab(btn, name) {
  document.querySelectorAll('#tabs-install .tab-btn').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#install-git, #install-docker, #install-nix').forEach(el => el.hidden = true);
  btn.classList.add('active');
  document.getElementById('install-' + name).hidden = false;
}

function switchOsTab(btn, os) {
  document.querySelectorAll('#tabs-os .tab-btn').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#os-win, #os-unix, #run-win, #run-unix').forEach(el => el.hidden = true);
  document.getElementById('os-' + os).hidden = false;
  document.getElementById('run-' + os).hidden = false;
}

const isWindows = navigator.userAgent.includes('Windows');
const defaultOs = isWindows ? 'win' : 'unix';
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('os-btn-' + defaultOs);
  if (btn) switchOsTab(btn, defaultOs);
});
