// Flow में हर खाना कैसे बनाना है, इसकी पक्की सूची। ऐप Flow को चला नहीं सकता, इसलिए यह आपको सही क्रम बताता है।
import { CREDITS } from '../config.js';

export const MODES = {
  frames: 'पहली फ्रेम से (Frames to Video)',
  ingredients: 'किरदार की इमेज से (Ingredients to Video)',
  extend: 'पिछली क्लिप को बढ़ाओ (Extend)',
};

// Extend: शॉट पिछले की सीधी निरंतरता हो। Ingredients: चेहरा बदल रहा हो (shot.faceDrift)। नहीं तो Frames।
export function pickMode(shot, i) {
  if (i > 0 && shot.continues) return 'extend';
  if (shot.faceDrift) return 'ingredients';
  return 'frames';
}

export const creditsPer = (quality) => CREDITS[quality] || CREDITS.fast;
export const estimate = (n, quality = 'fast') => n * creditsPer(quality);

export function recipe(shot, i, { quality = 'fast' } = {}) {
  const mode = pickMode(shot, i);
  const move = shot.camera && shot.camera.move;
  const moving = move && !/static/i.test(move);
  const steps = [];
  if (mode === 'extend') {
    steps.push('Flow में पिछली क्लिप खोलिए और "Extend" दबाइए।');
    steps.push('नीचे का वीडियो प्रॉम्प्ट चिपकाइए। Extend पिछली क्लिप के आख़िरी हिस्से से आगे बढ़ता है।');
  } else if (mode === 'ingredients') {
    steps.push('Flow में नया क्लिप शुरू कीजिए और "Ingredients to Video" चुनिए।');
    steps.push('किरदार की संदर्भ इमेज (3 तक) और इस खाने की इमेज डालिए।');
    steps.push('नीचे का वीडियो प्रॉम्प्ट चिपकाइए।');
  } else {
    steps.push('Flow में नया क्लिप शुरू कीजिए और "Frames to Video" चुनिए।');
    steps.push('पहले फ्रेम की जगह इस खाने की इमेज डालिए।');
    if (moving) steps.push(`कैमरा आइकन से "${move}" से मिलता विकल्प चुनिए (जैसे dolly in या pan left)। चाल प्रॉम्प्ट में पहले से लिखी है, न मिले तो छोड़ सकते हैं।`);
    steps.push('नीचे का वीडियो प्रॉम्प्ट चिपकाइए।');
  }
  steps.push(`सेटिंग: Veo 3.1, ${quality === 'fast' ? 'Fast' : 'Quality'}, 1 आउटपुट, 16:9, लगभग ${shot.duration} सेकंड।`);
  if (shot.dialogue) steps.push('इस खाने में संवाद है, इसलिए Flow में आवाज़ चालू रखिए।');
  steps.push('क्लिप बनने पर डाउनलोड करके यहाँ "क्लिप डालो" से डालिए।');
  return { mode, title: MODES[mode], steps, credits: creditsPer(quality) };
}
