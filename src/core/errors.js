export class AppError extends Error {
  constructor(msg, code = 'app') { super(msg); this.code = code; }
}
export class ApiError extends AppError {}

// हर त्रुटि को साफ़ हिंदी संदेश में बदलता है। retry सच हो तो दोबारा कोशिश करना ठीक है।
export function explain(e) {
  const msg = (e && e.message) || String(e);
  const code = e && e.code;
  if (code === 'nokey') return { text: 'पहले अपनी Gemini चाबी डालिए (⚙ सेटिंग)।', retry: false };
  if (code === 'net') return { text: 'इंटरनेट नहीं है। जुड़ने पर फिर कोशिश कीजिए।', retry: true };
  if (code === 429) return { text: 'Google की सीमा पूरी हुई। कुछ मिनट बाद फिर कोशिश कीजिए।', retry: true };
  if (code === 404) return { text: 'मॉडल का नाम नहीं मिला। सेटिंग में AI Studio वाला सही नाम डालिए।', retry: false };
  if (code === 403) return { text: 'इस चाबी को यह मॉडल इस्तेमाल करने की अनुमति नहीं है।', retry: false };
  if (code === 400 && /api key/i.test(msg)) return { text: 'चाबी गलत लगती है। सेटिंग में नई चाबी डालिए।', retry: false };
  if (typeof code === 'number' && code >= 500) return { text: 'Google की तरफ़ से दिक्कत है। थोड़ी देर बाद फिर कोशिश कीजिए।', retry: true };
  return { text: msg, retry: false };
}
