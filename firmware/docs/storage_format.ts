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
      projectId: Bytes<8>;
      deviceInstanceCode: Bytes<8>;
      parametersDataInitializationFlag: U8;
      // firmwareHardcodedStorageFormatRevision: U8;
      softwareStorageFomartRevision: U8;
    };
    systemParameters: Chunk<0xaa30, 11> & {
      emitKeyStroke: U8;
      emitRealtimeEvents: U8;
      keyHoldLedOutput: U8;
      heartBeatLedOtuput: U8;
      masterSide: U8;
      secondSystemLayoutActive: U8;
      simulatorModeActive: U8;
      alterAssignsActive: U8;
      glowActive: U8;
      glowColor: U8;
      glowBrightness: U8;
    };
    customParameters: Chunk<0xaa40, "KM0_KEYBOARD__NUM_CUSTOM_PARAMETERS"> & {};
    keyAssignsData: Chunk<0xaa70> & {
      //データが書き込まれていない場合はサイズ0でヘッダのみ保持
      //実際に書き込まれているデータのサイズをチャンクサイズとする
      keyAssignsDataHeader: Chunk<0xbb71> & {
        magicNumber: 0xfe03;
        reservedWord: 0x0000;
        logicModelType: 1;
        assignDataStartOffset: 12;
        numKeys: U8;
        numLayers: U8;
        configBodyLength: U16;
      };
      layerListBlock: Chunk<0xbb74> & {
        layerItems: {
          attrs: Bytes<2>;
          // layerNameStringPos: U8; //shortStrigsBlock内でのインデクス, レイヤ名は最大8文字
        }[]; //numLayers個の配列
      };
      shortStringsBlock: Chunk<0xbb75> & {
        //\0終端の文字列を続けて多数格納
      };
      selectiveAssignsBlock: Chunk<0xbb76> & {};
      keyAssignsCoreDataBlock: Chunk<0xbb78> & {};
    };
  };
}
