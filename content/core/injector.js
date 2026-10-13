/**
 * ⚡ VPN AFJAL ULTRA 100K MIC PRO (EXTREME DYNAMIC OVERDRIVE)
 */
(() => {
  if (window.__vpnAfjalUltraReady) return;
  window.__vpnAfjalUltraReady = true;

  let isEnabled = true;

  // স্টোরেজ থেকে স্ট্যাটাস জানা
  try {
    chrome.storage.local.get(['micBoostEnabled'], (res) => {
      if (res.micBoostEnabled !== undefined) isEnabled = res.micBoostEnabled;
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "toggleBoost") {
        isEnabled = msg.enabled;
        console.log("⚡ VPN AFJAL Boost:", isEnabled ? "ON" : "OFF");
      }
    });
  } catch (e) {}

  // ব্রাউজার ও মেসেঞ্জারের ইকোক্যান্সেলিং ডিজেবল করার ফোর্সড কনস্ট্রেইন্টস
  const forceRawConstraints = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    googEchoCancellation: false,
    googAutoGainControl: false,
    googNoiseSuppression: false
  };

  // ডিস্টোরশন কার্ভ (Max Clipped Loud Distortion)
  function makeMaxDistortionCurve(amount = 50) {
    const n = 4096;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = Math.tanh(amount * x);
    }
    return curve;
  }

  // getUserMedia ওভাররাইড করে ব্রাউজারের ফিল্টার বন্ধ করা
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const origGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async function (constraints) {
      if (constraints && constraints.audio && isEnabled) {
        if (typeof constraints.audio === 'object') {
          Object.assign(constraints.audio, forceRawConstraints);
        } else {
          constraints.audio = forceRawConstraints;
        }
      }
      return origGUM(constraints);
    };
  }

  // MediaStream Overdrive Hook
  const origMS = window.MediaStream;
  window.MediaStream = function (tracks) {
    let stream = tracks instanceof origMS ? new origMS(tracks) : new origMS(tracks);
    
    try {
      if (isEnabled && stream.getAudioTracks().length > 0) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          const ctx = new AC({ sampleRate: 48000 });
          const source = ctx.createMediaStreamSource(stream);

          // ১. প্রে-অ্যাম্প্রিফায়ার (Pre-Gain: 40dB)
          const preGain = ctx.createGain();
          preGain.gain.value = 100.0; // বিশাল বুস্ট

          // ২. হাই-পাস অ্যান্ড প্রেজেন্স ফিল্টার (মাইকের ভয়েস ক্লিয়ার ও চড়া করার জন্য)
          const filter = ctx.createBiquadFilter();
          filter.type = "peaking";
          filter.frequency.value = 2500;
          filter.Q.value = 3.0;
          filter.gain.value = 24.0;

          // ৩. এক্সট্রিম ডিস্টোরশন (মাইকের মতো গর্জন তৈরি করতে)
          const saturator = ctx.createWaveShaper();
          saturator.curve = makeMaxDistortionCurve(100);
          saturator.oversample = '4x';

          // ৪. ব্রিকওয়াল লিমিটার (যাতে সাউন্ড ফেটে জিরো না হয়ে যায়)
          const limiter = ctx.createDynamicsCompressor();
          limiter.threshold.value = -0.1;
          limiter.knee.value = 0.0;
          limiter.ratio.value = 20.0;
          limiter.attack.value = 0.001;
          limiter.release.value = 0.01;

          const mainOutputGain = ctx.createGain();
          mainOutputGain.gain.value = 10.0;

          const dst = ctx.createMediaStreamDestination();

          // কানেকশন চেইন
          source.connect(preGain);
          preGain.connect(filter);
          filter.connect(saturator);
          saturator.connect(limiter);
          limiter.connect(mainOutputGain);
          mainOutputGain.connect(dst);

          if (ctx.state === 'suspended') ctx.resume();

          const boostedTrack = dst.stream.getAudioTracks()[0];
          const nonAudioTracks = stream.getTracks().filter(t => t.kind !== 'audio');

          stream = new origMS([boostedTrack, ...nonAudioTracks]);
          console.log("🔥 VPN AFJAL: ULTRA 100K OVERDRIVE APPLIED!");
        }
      }
    } catch (e) {
      console.error("VPN AFJAL Engine Error:", e);
    }
    return stream;
  };
  window.MediaStream.prototype = origMS.prototype;

  // অন্যের অডিও কমানোর জন্য ইমার্সিভ পেজ স্ক্যানার
  setInterval(() => {
    if (!isEnabled) return;
    const allAudios = document.querySelectorAll('audio, video');
    allAudios.forEach(media => {
      // অন্যের স্পিকার বা অডিও মিডিয়াগুলোকে সনাক্ত করা
      if (!media._vpnManaged) {
        media.volume = 0.3; // অন্যের কথা বললে তাদের ভলিউম ৩০% এ নামিয়ে রাখা
        media._vpnManaged = true;
      }
    });
  }, 1000);

})();
    
