const fs = require('node:fs');
const { expo } = require('./app.json');

const iosGoogleServicesFile =
  process.env.GOOGLE_SERVICES_INFO_PLIST ??
  (fs.existsSync('./src/config/GoogleService-Info.plist')
    ? './src/config/GoogleService-Info.plist'
    : expo.ios?.googleServicesFile);

const androidGoogleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ??
  (fs.existsSync('./src/config/google-services.json')
    ? './src/config/google-services.json'
    : expo.android?.googleServicesFile);

const plugins = expo.plugins ?? [];
const hasRNFirebaseIOSPlugin = plugins.includes('./plugins/with-rn-firebase-ios');
const hasAndroidNdkVersionPlugin = plugins.includes('./plugins/with-android-ndk-version');
const hasFmtConstevalFixPlugin = plugins.includes('./plugins/with-fmt-consteval-fix');
const hasIosSdkrootAutoPlugin = plugins.includes('./plugins/with-ios-sdkroot-auto');
const hasDisableAndroidLintPlugin = plugins.includes('./plugins/with-disable-android-lint');
const hasLargeHeapPlugin = plugins.includes('./plugins/with-large-heap');
const hasPreviewDebuggablePlugin = plugins.includes('./plugins/with-preview-debuggable');

const resolvedPlugins = [
  ...plugins,
  ...(!hasRNFirebaseIOSPlugin ? ['./plugins/with-rn-firebase-ios'] : []),
  ...(!hasAndroidNdkVersionPlugin ? ['./plugins/with-android-ndk-version'] : []),
  ...(!hasFmtConstevalFixPlugin ? ['./plugins/with-fmt-consteval-fix'] : []),
  ...(!hasIosSdkrootAutoPlugin ? ['./plugins/with-ios-sdkroot-auto'] : []),
  ...(!hasDisableAndroidLintPlugin ? ['./plugins/with-disable-android-lint'] : []),
  ...(!hasLargeHeapPlugin ? ['./plugins/with-large-heap'] : []),
  ...(!hasPreviewDebuggablePlugin ? ['./plugins/with-preview-debuggable'] : []),
];

module.exports = {
  ...expo,
  plugins: resolvedPlugins,
  ios: {
    ...expo.ios,
    googleServicesFile: iosGoogleServicesFile,
  },
  android: {
    ...expo.android,
    googleServicesFile: androidGoogleServicesFile,
  },
};
