export const STYLE_LOCK = {
  'रियलिस्टिक सिनेमा': 'photorealistic cinematic film look, natural color grading, shallow depth of field',
  'कार्टून': 'vibrant stylized 3D cartoon, clean shapes, bright colors',
  'एनिमे': 'Japanese anime cel-shaded look, expressive lighting',
  'पेंटिंग जैसी': 'rich oil-painting look, visible brush texture, painterly light',
};
export const styleLock = (style) => STYLE_LOCK[style] || STYLE_LOCK['रियलिस्टिक सिनेमा'];

export const writeStory = (st) =>
  `इस विचार पर हिंदी में एक पूरी कहानी लिखो, ${st.len} सेकंड के वीडियो लायक, साफ़ दृश्यों के साथ। शैली: ${st.style}। विषय: ${st.theme}। स्रोत: ${st.src || 'कोई नहीं'}। विचार: ${st.idea}`;

const SPEECH = {
  'flow-en': 'संवाद अंग्रेज़ी में लिखो।',
  'flow-hi': 'संवाद हिंदी (देवनागरी) में लिखो।',
  'sfx-only': 'dialogue ख़ाली रखो। कथन "narration" में हिंदी में लिखो, जिसे ऐप अलग आवाज़ में जोड़ेगा।',
};

const FORMAT = 'केवल JSON लौटाओ, इस ढाँचे में: {"characters":[{"name":"","look":"full visual description in English","voice":"voice description in English, e.g. calm deep male voice in his 40s"}],"shots":[{"duration":6,"note":"हिंदी में एक पंक्ति","characters":["name"],"camera":{"type":"wide establishing | medium | close-up | aerial drone","move":"slow push in | orbit | tracking | static | crane up","lens":"24mm | 35mm | 85mm","angle":"eye level | low angle | high angle | overhead"},"subject":"who is in frame and where","action":"ONE main motion with physics","environment":"place, time of day, atmosphere","light":"light source and quality","continues":false,"dialogue":"","speaker":"","delivery":"","narration":"","sfx":"","ambience":""}]} सभी मान अंग्रेज़ी में रखो (note, narration और हिंदी संवाद को छोड़कर)। हर शॉट में सिर्फ़ एक मुख्य हरकत। एक शॉट में एक ही बोलने वाला, और संवाद छोटा (प्रति सेकंड 2 शब्द से कम)। अवधि 4, 6 या 8 सेकंड। continues तभी true जब शॉट पिछले शॉट की सीधी निरंतरता हो। धार्मिक विषय में स्रोत के अनुसार और सम्मान के साथ चलो।';

export const director = (st, n, a, b, { chars, last }) => [
  `तुम फ़िल्म निर्देशक हो। शैली: ${st.style}। विषय: ${st.theme}। स्रोत: ${st.src || 'कोई नहीं'}। कुल लंबाई: ${st.len} सेकंड, कुल लगभग ${n} शॉट। कहानी या विचार: ${st.idea}`,
  SPEECH[st.audioMode] || SPEECH['flow-en'],
  a ? `किरदार (वही रखो, बदलो मत): ${JSON.stringify(chars)}। अब तक का आख़िरी शॉट: ${last}।` : '',
  `कहानी को ${n} शॉट में फैलाओ, और अब सिर्फ़ शॉट ${a + 1} से ${b} तक (${b - a} शॉट) बनाओ।${b === n ? ' यह कहानी का अंत है।' : ''}`,
  FORMAT,
].filter(Boolean).join('\n');

export const repairPrompt = (prompt, problems) =>
  `तुम्हारा पिछला जवाब ठीक नहीं था: ${problems.join(' ')}\nवही काम दोबारा करो और केवल सही JSON लौटाओ।\n\n${prompt}`;
