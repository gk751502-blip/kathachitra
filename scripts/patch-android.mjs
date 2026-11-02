// Android प्रोजेक्ट बनने (npx cap add android) के बाद उसमें AdMob की ID, अनुमतियाँ और संस्करण संख्या डालता है।
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const MANIFEST = 'android/app/src/main/AndroidManifest.xml';
const GRADLE = 'android/app/build.gradle';
const ADMOB_APP_ID = process.env.ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713';
const VERSION_CODE = process.env.VERSION_CODE || '1';
const VERSION_NAME = process.env.VERSION_NAME || '1.0.' + VERSION_CODE;

for (const f of [MANIFEST, GRADLE]) {
  if (!existsSync(f)) {
    console.error(`फ़ाइल नहीं मिली: ${f}। पहले "npx cap add android" चलाइए।`);
    process.exit(1);
  }
}

let manifest = await readFile(MANIFEST, 'utf8');
if (!manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  manifest = manifest.replace(
    '</application>',
    `    <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${ADMOB_APP_ID}" />\n    </application>`,
  );
}
for (const perm of ['android.permission.ACCESS_NETWORK_STATE', 'com.google.android.gms.permission.AD_ID']) {
  if (!manifest.includes(perm)) {
    manifest = manifest.replace('</manifest>', `    <uses-permission android:name="${perm}" />\n</manifest>`);
  }
}
await writeFile(MANIFEST, manifest);

let gradle = await readFile(GRADLE, 'utf8');
gradle = gradle
  .replace(/(versionCode\s*=?\s*)\d+/, (_, p) => p + VERSION_CODE)
  .replace(/(versionName\s*=?\s*)"[^"]*"/, (_, p) => p + `"${VERSION_NAME}"`);
await writeFile(GRADLE, gradle);

console.log(`Android प्रोजेक्ट तैयार: AdMob ID ${ADMOB_APP_ID}, संस्करण ${VERSION_NAME} (${VERSION_CODE})`);
