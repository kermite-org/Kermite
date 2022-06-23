export const featureFlags = {
  // MacOSでアプリ終了時にnode-usbの実装でSIGABRTが出る問題があるため、
  // AVRのDFUブートローダの対応を一旦無効化
  // supportFirmwareUpdateSchemeAvrDfu: false,
  // 211210
  // electronとnode-usbを更新してDFU対応を有効化
  // supportFirmwareUpdateSchemeAvrDfu: true,
};
// if (process.env.NODE_ENV === 'development') {
//   console.log('feature flag allowEditLocalProject enabled');
//   featureFlags.allowEditLocalProject = true;
// }
