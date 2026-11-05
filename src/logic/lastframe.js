// क्लिप की जानकारी (अवधि, आकार), आख़िरी फ्रेम और काले फ्रेम की जाँच।
import { meanBrightness } from './critic.js';

export function probeClip(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = url;
    let finished = false;
    const finish = (fn, arg) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      fn(arg);
    };
    const timer = setTimeout(() => finish(reject, new Error('क्लिप पढ़ने में बहुत समय लगा।')), 20000);

    const grab = () => {
      if (finished) return;
      const c = document.createElement('canvas');
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const x = c.getContext('2d');
      x.drawImage(v, 0, 0);
      const data = x.getImageData(0, 0, c.width, c.height).data;
      const duration = isFinite(v.duration) ? v.duration : 0;
      c.toBlob((blob) => {
        if (!blob) return finish(reject, new Error('फ्रेम नहीं निकला।'));
        finish(resolve, { blob, dark: meanBrightness(data) < 8, duration, width: v.videoWidth, height: v.videoHeight });
      }, 'image/jpeg', 0.85);
    };

    v.onerror = () => finish(reject, new Error('क्लिप पढ़ी नहीं जा सकी।'));
    v.onloadedmetadata = () => {
      const target = Math.max(0, (isFinite(v.duration) ? v.duration : 0) - 0.1);
      if (target > 0) v.currentTime = target;
    };
    v.onseeked = grab;
    v.onloadeddata = () => { if (!isFinite(v.duration) || v.duration <= 0.1) grab(); };
  });
}
