namespace ns_storage_format {
  type Chunk<ChunkSignatureWord, Length = 0> = {};

  type Bytes<N> = number[];

  type U8 = number;
  type U16 = number;

  /*
ツリー階層のチャンクによりデータを管理
チャンク形式
WWWW LL LL BB BB ...
WWWW: チャンク識別子, 2バイトの値
LL LL: チャンクのボディデータ長, 2バイト
BB BB ...: チャンクのボディデータ, LL LL で規定されるサイズのバイト列
*/

  type StorageData = {
    margicNumber: 0xa37e;
    userData?: Chunk<0xaa10, "KM0_STORAGE__USER_STORAGE_SIZE">;
    systemData: Chunk<0xaa20, 18> & {
      projectId: Bytes<6>;
      __reserved1: Bytes<2>;
      __reserved2: Bytes<8>;
      storageSystemParametersRevision: U8;
      softwareStorageFomartRevision: U8;
    };
    systemParameters: Chunk<0xaa30, 10> & {
      emitRealtimeEvents: U8;
      keyHoldLedOutput: U8;
      heartBeatLedOutput: U8;
      masterSide: U8;
      systemLayout: U8;
      wiringMode: U8;
      glowActive: U8;
      glowColor: U8;
      glowBrightness: U8;
      glowPattern: U8;
    };
    customParameters: Chunk<0xaa40, "KM0_KEYBOARD__NUM_CUSTOM_PARAMETERS"> & {};
    profileData: Chunk<0xaa70> & {
      //データが書き込まれていない場合はサイズ0でチャンクヘッダのみ保持
      //データを書き込んだ場合は実際に書き込まれているデータのサイズをチャンクサイズとする
      profileHeader: Chunk<0xbb71> & {
        logicModelType: 0x01;
        configStorageFormatRevision: U8;
        profileBinaryFormatRevision: U8;
        numKeys: U8;
        numLayers: U8;
      };
      profileSettings: Chunk<0xbb72> & {
        shiftCancelMode: U8;
        tapHoldThresholdMs: U16;
        useInterruptHold: U8;
      };
      layerList: Chunk<0xbb74> & {
        layerItems: {
          attrs: Bytes<2>;
          // layerNameStringPos: U8; //shortStrigsBlock内でのインデクス, レイヤ名は最大8文字
        }[]; //numLayers個の配列
      };
      mappingEntries: Chunk<0xbb76> & {
        numItems: U8;
        items: Bytes<5>[];
      };
      // shortStringsBlock: Chunk<0xbb75> & {
      //   //\0終端の文字列を続けて多数格納
      // };
      // selectiveAssignsBlock: Chunk<0xbb76> & {};
      keyAssigns: Chunk<0xbb78> & {};
    };
  };
}
