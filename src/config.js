// सारी ID, कीमत और सीमाएँ एक जगह। शुरू में विज्ञापन की सब ID Google की टेस्ट ID हैं।
export const APP = { name: 'कथाचित्र', id: 'com.kathachitra.app', version: '1.0.0' };

export const ADS = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  banner: 'ca-app-pub-3940256099942544/6300978111',
  testing: true,
  minGapSec: 120,
  everyNApprovals: 3,
};

export const BILLING = {
  apiKey: 'REPLACE_WITH_REVENUECAT_PUBLIC_KEY',
  entitlement: 'pro',
  graceDays: 7,
};

export const GEMINI = {
  textModel: 'gemini-flash-latest',
  imageModel: 'gemini-3.1-flash-image-preview',
  timeoutMs: 120000,
  retries: 3,
};

export const LIMITS = {
  imageTries: 3,
  shotBatch: 12,
  secondsPerShot: 6,
  maxLenSec: 900,
};

export const CREDITS = { fast: 20, quality: 100 };

export const REMOTE_URL = '';
