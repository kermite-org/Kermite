// ConfigStorageFormatRevision
// 210422 3-->4, OperationWordを2バイトの固定長から1~4バイトの可変長に変更
// 210508 4-->5, 論理キーコードを使用するように変更
// 210509 5-->6, チャンク単位でデータを格納するように変更
export const ConfigStorageFormatRevision = 6;

// 210705, 2, メッセージ形式を簡素化
// 210719, 3, deviceAttributesResponseを整理
// 210824, 4, CustomParametersReadResponseにパラメタ公開フラグを追加
export const RawHidMessageProtocolRevision = 4;

// 210509 1, 初版
// 210515 2, mappingEntriesを追加
// 210601 3, 論理キーのshiftとctrlの値を修正
// 210705 4, OpType/ExOpTypeを整理
// 211008 5, ProfilesSettingsチャンクを追加
export const ProfileBinaryFormatRevision = 5;

// 210513, 1, 初版
// 210522, 2, systemLayoutをUS:1,JIS:2に変更
// 210706, 3, emitKeyStrokeを削除
// 210706, 4, systemLayoutをUS:0,JIS:1に戻す
// 210712, 5, glowDirectionとglowSpeedを削除
export const ConfigParametersRevision = 5;
