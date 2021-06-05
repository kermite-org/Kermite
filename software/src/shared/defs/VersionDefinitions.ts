// ConfigStorageFormatRevision
// 210422 3-->4, OperationWordを2バイトの固定長から1~4バイトの可変長に変更
// 210508 4-->5, 論理キーコードを使用するように変更
// 210509 5-->6, チャンク単位でデータを格納するように変更
export const ConfigStorageFormatRevision = 6;

export const RawHidMessageProtocolRevision = 1;

// 210509 1, 初版
// 210515 2, mappingEntriesを追加
// 210601 3, 論理キーのshiftとctrlの値を修正
export const ProfileBinaryFormatRevision = 3;

// 210513, 1, 初版
// 210522, 2, sytemLayoutをUS:1,JIS:2に変更
export const ConfigParametersRevision = 2;
