const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withLargeHeap(config) {
  return withAndroidManifest(config, (mod) => {
    if (mod.modResults.manifest && mod.modResults.manifest.application) {
      mod.modResults.manifest.application[0].$['android:largeHeap'] = 'true';
    }
    return mod;
  });
};
