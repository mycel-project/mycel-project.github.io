const urlParams = new URLSearchParams(window.location.search);
let selectedClient = urlParams.get('client') || 'mycelium';
let selectedSetup = urlParams.get('setup') || 'cloud';

function updateURL() {
  const url = new URL(window.location);
  url.searchParams.set('client', selectedClient);
  url.searchParams.set('setup', selectedSetup);
  window.history.replaceState({}, '', url);
}

function switchClientTab(btn, name) {
  selectedClient = name;
  document.querySelectorAll('#tabs-client .tab-btn').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-mycelium').hidden = name !== 'mycelium';
  document.getElementById('tab-other').hidden = name !== 'other';
  updateConnectNote();
  updateClientLabels();
  updateURL();
}

function switchSetupTab(btn, name) {
  selectedSetup = name;
  const group = btn.closest('section');
  group.querySelectorAll('.tab-content').forEach(el => el.hidden = true);
  group.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  group.querySelector('#tab-' + name).hidden = false;
  btn.classList.add('active');
  updateConnectSection();
  updateURL();
}

function updateConnectSection() {
    document.querySelectorAll('#section-connect > div').forEach(el => el.hidden = true);
    document.getElementById('connect-' + selectedSetup).hidden = false;
    document.getElementById('trouble-cloud').hidden = selectedSetup !== 'cloud';
    document.getElementById('trouble-self').hidden = selectedSetup !== 'self';
    document.getElementById('ts-token').hidden = selectedSetup !== 'cloud';
    updateConnectNote();
}

function updateConnectNote() {
  document.getElementById('connect-other-note').hidden = selectedClient === 'mycelium';
}

function updateClientLabels() {
  document.querySelectorAll('.if-mycelium').forEach(el => el.hidden = selectedClient !== 'mycelium');
  document.querySelectorAll('.if-other').forEach(el => el.hidden = selectedClient === 'mycelium');
}

const clientBtn = document.querySelector(`#tabs-client .tab-btn[onclick*="${selectedClient}"]`);
if (clientBtn) switchClientTab(clientBtn, selectedClient);

const setupBtn = document.querySelector(`#section-setup .tab-btn[onclick*="${selectedSetup}"]`);
if (setupBtn) switchSetupTab(setupBtn, selectedSetup);
