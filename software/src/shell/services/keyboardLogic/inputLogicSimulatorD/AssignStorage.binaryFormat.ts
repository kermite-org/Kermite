/* eslint-disable @typescript-eslint/no-unused-vars */

// pseudo type definition for assign data binary buffer

namespace AssignStroageBinaryFormat {
  // --------------------
  // types

  type valueOf<T> = T[keyof T];

  type s8 = number;
  type u8 = number; // unsigend byte
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

  // n bytes
  type bytes1 = number[];
  type bytes2 = number[];
  type bytes3 = number[];
  type bytes4 = number[];
  type bytes5 = number[];
  type bytes6 = number[];
  type bytes7 = number[];
  type bytes8 = number[];

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
    bit15_14: { fOperationType: Fixed<b2, 1> };
    bit13: Reserved;
    bit12: { fIsShiftLayer: b1 };
    bit11_8: { fModifiers: AttachedModifiers };
    bit7: Reserved;
    bit6_0: { fLogicalKeyCode: b7 };
  };

  type LayerInvocationModeValues = DefineValues<b4> & {
    hold: 1;
    turnOn: 2;
    turnOff: 3;
    toggle: 4;
    oneshot: 5;
  };

  type OpLayerCall = BasedOn<u16> & {
    bit15_14: { fOperationType: Fixed<b2, 2> };
    bit13_12: Reserved;
    bit11_8: { fTargetLayerIndex: b4 };
    bit7_4: { fLayerInvocationMode: OneOf<b4, LayerInvocationModeValues> };
    bit3_0: Reserved;
  };

  type ExOperationHeadByte<F extends number> = {
    bit7_6: { fOperationType: Fixed<b2, 3> };
    bit5_3: Reserved;
    bit2_0: { fExOperationType: Fixed<b3, F> };
  };

  type OpLayerClearExclusive = BasedOn<u16> & {
    bit15_8: { headByte: ExOperationHeadByte<1> };
    bit7_3: Reserved;
    bit2_0: { fTargetExclusionGroup: b3 };
  };

  type OpMousePointerMove = BasedOn<u24> & {
    bit23_16: { headByte: ExOperationHeadByte<2> };
    bit15_8: { fMoveAmountX: s8 };
    bit7_0: { fMoveAmountY: s8 };
  };

  type OpCustomCommand = BasedOn<u16> & {
    bit15_8: { headByte: ExOperationHeadByte<3> };
    bit7_0: { fCommandIndex: u8 };
  };

  type AssignOpeartion = VariableLength<1, 4> &
    (
      | OpNoOperation
      | OpKeyInput
      | OpLayerCall
      | OpLayerClearExclusive
      | OpMousePointerMove
      | OpCustomCommand
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

  type AssignEntryHeaderA<
    TAssignTypeValue extends valueOf<AssignTypeValues>
  > = BasedOn<u8> & {
    bit7: Fixed<b1, 1>;
    bit6_4: { fAssignType: TAssignTypeValue };
    bit3_0: { fLayerIndex: b4 }; // 0~15
  };

  type AssignEntryHeaderB<
    TAssignTypeValue extends valueOf<AssignTypeValues>
  > = BasedOn<u16> & {
    bit15: Fixed<b1, 1>;
    bit14_12: { fAssignType: TAssignTypeValue };
    bit11_8: { fLayerIndex: b4 }; // 0~15
    bit7_6: { fOpWordLengthCodePrimary: b2 };
    bit5_3: { fOpWordLengthCodeSecondary: b3 };
    bit2_0: { fOpWordLengthCodeTertiary: b3 };
  };

  type BlockAssignEntry = BasedOn<bytes1> & {
    byte0: { header: AssignEntryHeaderA<4> };
  };

  type TransparentAssignEntry = BasedOn<bytes1> & {
    byte0: { header: AssignEntryHeaderA<5> };
  };

  type SingleAssignEntry = VariableLength<3, 6> & {
    byte0_1: { header: AssignEntryHeaderB<1> };
    vl_min1_max4: { operation: AssignOpeartion };
  };

  type DualAssignEntry = VariableLength<4, 10> & {
    byte0_1: { header: AssignEntryHeaderB<2> };
    vl_min1_max4_a: { opPrimary: AssignOpeartion };
    vl_min1_max4_b: { opSecondary: AssignOpeartion };
  };

  type TripleAssignEntry = VariableLength<5, 14> & {
    byte0_1: { header: AssignEntryHeaderB<3> };
    vl_min1_max4_a: { opPrimary: AssignOpeartion };
    vl_min1_max4_b: { opSecondary: AssignOpeartion };
    vl_min1_max4_c: { opTertiary: AssignOpeartion };
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

  type ConfigStorageHeaderBytes = {
    byte0_1: { magicNumber: Fixed<u16, 0xfe03> };
    byte2_3: { reservedWord: Fixed<u16, Reserved> };
    byte4: { logicModelType: Fixed<u8, 1> };
    byte5: { formatRevision: u8 };
    byte6: { assignDataStartOffset: Fixed<u8, 12> };
    byte7: { numKeys: u8 }; // 1~255
    byte8: { numLayers: u8 }; // 1~16
    byte9_10: { bodyLength: u16 };
    byte11: { reservedByte: u8 };
  };

  type ConfigStorageDataBlobBytes = {
    'pos(0),len(12)': { headerBytes: ConfigStorageHeaderBytes };
    'pos(12),len(NL*2)': { layerAttributes: LayerAttributeWord[] }; // numLayers*2 bytes
    'pos(12+NL*2),len(BL-NL*2)': { keyAssigns: KeyBoundAssignDataSet[] }; // bodyLength-numLayers*2 bytes
  };
}
