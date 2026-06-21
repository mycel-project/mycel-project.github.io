let selectedClient = 'mycelium';
let selectedSetup = 'cloud';

function switchClientTab(btn, name) {
  selectedClient = name;
  document.querySelectorAll('#tabs-client .tab-btn').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-mycelium').hidden = name !== 'mycelium';
  document.getElementById('tab-other').hidden = name !== 'other';
  updateConnectNote();
  updateClientLabels();
}

function switchSetupTab(btn, name) {
  selectedSetup = name;
  const group = btn.closest('section');
  group.querySelectorAll('.tab-content').forEach(el => el.hidden = true);
  group.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  group.querySelector('#tab-' + name).hidden = false;
  btn.classList.add('active');
  updateConnectSection();
}

function updateConnectSection() {
  document.querySelectorAll('#section-connect > div').forEach(el => el.hidden = true);
  document.getElementById('connect-' + selectedSetup).hidden = false;
  document.getElementById('trouble-cloud').hidden = selectedSetup !== 'cloud';
  document.getElementById('trouble-self').hidden = selectedSetup !== 'self';
  updateConnectNote();
}

function updateConnectNote() {
  document.getElementById('connect-other-note').hidden = selectedClient === 'mycelium';
}

function updateClientLabels() {
  document.querySelectorAll('.if-mycelium').forEach(el => el.hidden = selectedClient !== 'mycelium');
  document.querySelectorAll('.if-other').forEach(el => el.hidden = selectedClient === 'mycelium');
}

updateClientLabels();
