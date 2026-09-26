const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Android's native "Lint" tool runs a "lint vital" static-analysis gate before
 * assembling a release build, across every module including third-party ones.
 * On CI and resource-constrained environments, lintVitalAnalyzeRelease frequently
 * fails with `OutOfMemoryError` inside the AGP lint worker.
 * Disabling it ensures reliable APK/AAB release builds.
 */
module.exports = function withDisableAndroidLint(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language === 'groovy') {
      if (!mod.modResults.contents.includes('checkReleaseBuilds false')) {
        mod.modResults.contents += `
android {
    lint {
        checkReleaseBuilds false
        abortOnError false
    }
}
`;
      }
    }
    return mod;
  });
};
