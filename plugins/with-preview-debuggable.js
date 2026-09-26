const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withPreviewDebuggable(config) {
  if (process.env.EAS_BUILD_PROFILE !== 'preview') return config;
  return withAndroidManifest(config, (mod) => {
    if (mod.modResults.manifest && mod.modResults.manifest.application) {
      mod.modResults.manifest.application[0].$['android:debuggable'] = 'true';
    }
    return mod;
  });
};
