# कथाचित्र

कहानी से दृश्य, इमेज और Flow के लिए वीडियो प्रॉम्प्ट, फिर क्लिप जोड़कर अंतिम वीडियो।

## APK बनाना
1. GitHub पर Actions टैब खोलिए।
2. "Build Android APK" चुनकर Run workflow दबाइए।
3. बन जाने पर उसी रन के नीचे Artifacts से `kathachitra-apk` डाउनलोड कीजिए।

## बाद में बदलने वाली चीज़ें
- AdMob की असली ऐप ID: रिपॉज़िटरी की Settings, फिर Variables में `ADMOB_APP_ID` नाम से डालिए।
- विज्ञापन इकाई और RevenueCat की चाबी: `src/config.js` में।
- शुरू में Google की टेस्ट ID लगी हैं, इसलिए असली विज्ञापन नहीं आएँगे।
