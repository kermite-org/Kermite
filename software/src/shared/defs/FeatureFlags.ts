export const featureFlags = {
  // MacOSでアプリ終了時にnode-usbの実装でSIGABRTが出る問題があるため、
  // AVRのDFUブートローダの対応を一旦無効化
  supportFirmwareUpdateSchemeAvrDfu: false,
};
// if (process.env.NODE_ENV === 'development') {
//   console.log('feature flag allowEditLocalProject enabled');
//   featureFlags.allowEditLocalProject = true;
// }
