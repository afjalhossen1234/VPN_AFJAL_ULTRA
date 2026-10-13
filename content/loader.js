(function () {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('core/injector.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
    console.log("⚡ VPN AFJAL ULTRA 100K MIC LOADED!");
  } catch (e) {
    console.error("VPN AFJAL Loader Error:", e);
  }
})();

