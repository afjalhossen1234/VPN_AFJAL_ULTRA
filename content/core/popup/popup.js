const toggle = document.getElementById('toggleBoost');
const status = document.getElementById('status');

chrome.storage.local.get(['micBoostEnabled'], (res) => {
  const active = res.micBoostEnabled !== false;
  toggle.checked = active;
  updateUI(active);
});

toggle.addEventListener('change', () => {
  const active = toggle.checked;
  updateUI(active);
  chrome.storage.local.set({ micBoostEnabled: active });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleBoost", enabled: active }).catch(() => {});
    }
  });
});

function updateUI(active) {
  status.innerText = active ? "STATUS: MAX POWER" : "STATUS: DISABLED";
  status.style.color = active ? "#22c55e" : "#ef4444";
        }
