/* eslint-disable @typescript-eslint/no-unused-vars */

// pseudo type definition for assign data binary buffer

namespace AssignStorageBinaryFormat {
  // --------------------
  // types

  type valueOf<T> = T[keyof T];

  type s8 = number;
  type u8 = number; // unsigned byte
  type u16 = number; // unsigned short, big endian
  type u24 = number;

  // bits
  type b1 = number;
  type b2 = number;
  type b3 = number;
  type b4 = number;
  type b5 = number;
  type b6 = number;
  type b7 = number;
  type b8 = number;

  type Reserved = {};
  type BasedOn<T> = T;
  type DefineValues<T> = {};
  type Fixed<T, val> = val;
  type OneOf<T, val> = val;
  type VariableLength<lo = 1, hi = 99> = {};

  // --------------------
  // attached modifiers

  type AttachedModifiers = BasedOn<b4> & {
    bit3: { fOS: b1 };
    bit2: { fAlt: b1 };
    bit1: { fShift: b1 };
    bit0: { fCtrl: b1 };
  };

  // --------------------
  // assign operation

  type OpNoOperation = BasedOn<u8> & {
    bit7_6: { fOperationType: Fixed<b2, 0> };
    bit5_0: Reserved;
  };

  type OpKeyInput = BasedOn<u16> & {
    bit15_14: { fOperationType: Fixed<b2, 0b01> };
    bit13: Reserved;
    bit12: { isBelongToShiftLayer: b1 };
    bit11_8: { fModifiers: AttachedModifiers };
    bit7_0: { fLogicalKeyCode: b8 };
  };

  type ExOperationHeadByte<F extends number> = {
    bit7_6: { fOperationType: Fixed<b2, 0b11> };
    bit5_3: Reserved;
    bit2_0: { fExOperationType: Fixed<b3, F> };
  };

  type LayerInvocationModeValues = DefineValues<b4> & {
    hold: 1;
    turnOn: 2;
    turnOff: 3;
    toggle: 4;
    oneshot: 5;
  };

  type OpLayerCall = BasedOn<u16> & {
    bit15_8: { headByte: ExOperationHeadByte<0b001> };
    bit7_4: { fLayerInvocationMode: OneOf<b4, LayerInvocationModeValues> };
    bit3_0: { fTargetLayerIndex: b4 };
  };

  type OpLayerClearExclusive = BasedOn<u16> & {
    bit15_8: { headByte: ExOperationHeadByte<0b010> };
    bit7_3: Reserved;
    bit2_0: { fTargetExclusionGroup: b3 };
  };

  type OpSystemAction = BasedOn<u16> & {
    bit15_8: { headByte: ExOperationHeadByte<0b011> };
    bit7_0: { fCommandIndex: u8 };
  };

  type OpMousePointerMove = BasedOn<u24> & {
    bit23_16: { headByte: ExOperationHeadByte<0b100> };
    bit15_8: { fMoveAmountX: s8 };
    bit7_0: { fMoveAmountY: s8 };
  };

  type AssignOperation = VariableLength<1, 4> &
    (
      | OpNoOperation
      | OpKeyInput
      | OpLayerCall
      | OpLayerClearExclusive
      | OpSystemAction
      | OpMousePointerMove
    );

  // --------------------
  // assign entry
  type AssignTypeValues = DefineValues<b3> & {
    reserved: 0;
    single: 1;
    dual: 2;
    triple: 3;
    block: 4;
    transparent: 5;
  };

  type AssignEntryHeaderA<TAssignTypeValue extends valueOf<AssignTypeValues>> =
    BasedOn<u8> & {
      bit7: Fixed<b1, 1>;
      bit6_4: { fAssignType: TAssignTypeValue };
      bit3_0: { fLayerIndex: b4 }; // 0~15
    };

  type AssignEntryHeaderB<TAssignTypeValue extends valueOf<AssignTypeValues>> =
    BasedOn<u16> & {
      bit15: Fixed<b1, 1>;
      bit14_12: { fAssignType: TAssignTypeValue };
      bit11_8: { fLayerIndex: b4 }; // 0~15
      bit7_6: { fOpWordLengthCodePrimary: b2 };
      bit5_3: { fOpWordLengthCodeSecondary: b3 };
      bit2_0: { fOpWordLengthCodeTertiary: b3 };
    };

  type BlockAssignEntry = BasedOn<u8> & {
    byte0: { header: AssignEntryHeaderA<4> };
  };

  type TransparentAssignEntry = BasedOn<u8> & {
    byte0: { header: AssignEntryHeaderA<5> };
  };

  type SingleAssignEntry = VariableLength<3, 6> & {
    byte0_1: { header: AssignEntryHeaderB<1> };
    vl_min1_max4: { operation: AssignOperation };
  };

  type DualAssignEntry = VariableLength<4, 10> & {
    byte0_1: { header: AssignEntryHeaderB<2> };
    vl_min1_max4_a: { opPrimary: AssignOperation };
    vl_min1_max4_b: { opSecondary: AssignOperation };
  };

  type TripleAssignEntry = VariableLength<5, 14> & {
    byte0_1: { header: AssignEntryHeaderB<3> };
    vl_min1_max4_a: { opPrimary: AssignOperation };
    vl_min1_max4_b: { opSecondary: AssignOperation };
    vl_min1_max4_c: { opTertiary: AssignOperation };
  };

  type AssignEntry = VariableLength &
    (
      | BlockAssignEntry
      | TransparentAssignEntry
      | SingleAssignEntry
      | DualAssignEntry
      | TripleAssignEntry
    );

  // --------------------
  // key bound assign data set

  type KeyBoundAssignDataSetHeader = BasedOn<u16> & {
    bit15: Fixed<b1, 1>;
    bit14_8: { fBodyLength: b6 }; // 1~127
    bit7_0: { fKeyIndex: b8 }; // 0~255
  };

  type KeyBoundAssignDataSet = {
    byte0_1: { header: KeyBoundAssignDataSetHeader };
    byte2__: { assigns: AssignEntry[] }; // max 127bytes of assigns body
  };

  // --------------------
  // layer attributes

  type LayerDefaultSchemeValues = DefineValues<b1> & {
    transparent: 0;
    block: 1;
  };

  type LayerAttributeWord = BasedOn<u16> & {
    bit15: { fDefaultScheme: OneOf<b1, LayerDefaultSchemeValues> };
    bit14: Reserved;
    bit13: { fInitialActive: b1 };
    bit12_8: { fAttachedModifiers: AttachedModifiers };
    bit7_3: Reserved;
    bit2_0: { fExclusionGroup: b3 };
  };

  // --------------------
  // profile header

  type ProfileHeaderContent = {
    logicModelType: 0x01;
    configStorageFormatRevision: u8;
    profileBinaryFormatRevision: u8;
    numKeys: u8; // 1~254
    numLayers: u8; // 1-16
  };

  // --------------------
  // mapping entry

  type MappingEntryItem = {
    channelIndex: u8;
    srcKeyCode: u8;
    srcModifiers: u8;
    dstKeyCode: u8;
    dstModifiers: u8;
  };

  // --------------------
  // data chunks

  type Chunk<ChunkSignatureWord, Length = 0> = {};

  type BinaryProfileData = Chunk<0xaa70> & {
    profileHeader: Chunk<0xbb71> & {
      data: ProfileHeaderContent;
    };
    layerList: Chunk<0xbb74> & {
      items: LayerAttributeWord[]; // numLayers個の配列
    };
    mappingEntries: Chunk<0xbb76> & {
      numItems: u8;
      items: MappingEntryItem[];
    };
    // shortStringsBlock: Chunk<0xbb75> & {
    //   //\0終端の文字列を続けて多数格納
    // };
    // selectiveAssignsBlock: Chunk<0xbb76> & {};
    keyAssigns: Chunk<0xbb78> & {
      items: KeyBoundAssignDataSet[];
    };
  };
}
