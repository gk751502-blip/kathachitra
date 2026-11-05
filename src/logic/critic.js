// हल्की जाँच, जो बिना इंटरनेट और बिना Gemini के चलती है। नतीजा चेतावनियों की सूची है।

// पिक्सल की औसत चमक (0 से 255)। step जितना बड़ा, उतने कम पिक्सल देखे जाते हैं।
export function meanBrightness(data, step = 997) {
  let sum = 0, n = 0;
  for (let k = 0; k + 2 < data.length; k += 4 * step) { sum += (data[k] + data[k + 1] + data[k + 2]) / 3; n++; }
  return n ? sum / n : 0;
}

// info: { dark, duration, width, height }, shot: योजना वाला खाना
export function checkClip(info, shot) {
  const issues = [];
  if (info.dark) issues.push('आख़िरी फ्रेम बहुत काला है।');
  if (info.duration && shot && shot.duration) {
    const r = info.duration / shot.duration;
    if (r < 0.6) issues.push(`क्लिप योजना (${shot.duration} सेकंड) से बहुत छोटी है: ${info.duration.toFixed(1)} सेकंड।`);
    if (r > 1.6) issues.push(`क्लिप योजना (${shot.duration} सेकंड) से बहुत लंबी है: ${info.duration.toFixed(1)} सेकंड।`);
  }
  if (info.width && info.height) {
    if (Math.abs(info.width / info.height - 16 / 9) > 0.1) issues.push('क्लिप 16:9 नहीं है, किनारों पर काली पट्टी आ सकती है।');
    if (info.width < 640) issues.push('क्लिप का रेज़ोल्यूशन कम है।');
  }
  return issues;
}
