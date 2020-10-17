/* eslint-disable @typescript-eslint/no-unused-vars */

// pseudo type definition for assign data binary buffer

namespace AssignStroageBinaryFormat {
  // --------------------
  // types

  // unsigend byte, unsigned short
  type u8 = number;
  type u16 = number;

  // bits
  type b1 = number;
  type b2 = number;
  type b3 = number;
  type b4 = number;
  type b5 = number;
  type b6 = number;
  type b7 = number;

  // n bytes
  type bytes1 = number[];
  type bytes2 = number[];
  type bytes3 = number[];
  type bytes4 = number[];
  type bytes5 = number[];
  type bytes6 = number[];
  type bytes7 = number[];
  type bytes8 = number[];

  type Reserved = any;
  type BasedOn<T> = T;
  type DefineValues<T> = T;
  type Fixed<T, val> = val;
  type OneOf<T, val> = val;

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

  type OpNoOperation = BasedOn<u16> & {
    bit15_14: { fOperationType: Fixed<b2, 0> };
    bit13_0: Reserved;
  };

  type OpKeyInput = BasedOn<u16> & {
    bit15_14: { fOperationType: Fixed<b2, 1> };
    bit13_10: { fModifiers: AttachedModifiers };
    bit9: { fShiftCancel: b1 };
    bit8: { fShiftOn: b1 };
    bit7_0: { fHidKeyCode: u8 };
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

  type OpLayerClearExclusive = BasedOn<u16> & {
    bit15_14: { fOperationType: Fixed<b2, 3> };
    bit13_11: Reserved;
    bit10_8: { fTargetExclusionGroup: b3 };
    bit7_0: Reserved;
  };

  type AssignOpeartion = BasedOn<u16> &
    (OpNoOperation | OpKeyInput | OpLayerCall | OpLayerClearExclusive);

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

  type AssignEntryHeader<TAssignTypeValue> = BasedOn<u8> & {
    bit7: Fixed<b1, 1>;
    bit6_4: { fAssignType: TAssignTypeValue };
    bit3_0: { fLayerIndex: b4 }; // 0~15
  };

  type BlockAssignEntry = BasedOn<bytes1> & {
    byte0: { header: AssignEntryHeader<AssignTypeValues['block']> };
  };

  type TransparentAssignEntry = BasedOn<bytes1> & {
    byte0: { header: AssignEntryHeader<AssignTypeValues['transparent']> };
  };

  type SingleAssignEntry = BasedOn<bytes3> & {
    byte0: { header: AssignEntryHeader<AssignTypeValues['single']> };
    byte1_2: { operation: AssignOpeartion };
  };

  type DualAssignEntry = BasedOn<bytes5> & {
    byte0: { header: AssignEntryHeader<AssignTypeValues['dual']> };
    byte1_2: { opPrimary: AssignOpeartion };
    byte3_4: { opSecondary: AssignOpeartion };
  };

  type TripleAssignEntry = BasedOn<bytes7> & {
    byte0: { header: AssignEntryHeader<AssignTypeValues['triple']> };
    byte1_2: { opPrimary: AssignOpeartion };
    byte3_4: { opSecondary: AssignOpeartion };
    byte5_6: { opTertially: AssignOpeartion };
  };

  type AssignEntry =
    | BlockAssignEntry
    | TransparentAssignEntry
    | SingleAssignEntry
    | DualAssignEntry
    | TripleAssignEntry;

  // --------------------
  // key bound assign data set

  type KeyBoundAssignDataSetHeader = BasedOn<u16> & {
    bit15: Fixed<b1, 1>;
    bit14_8: { fKeyIndex: b7 }; // 0~127
    bit7_5: Reserved;
    bit4_0: { fBodyLength: b5 }; // 1~31
  };

  type KeyBoundAssignDataSet = {
    byte0_1: { header: KeyBoundAssignDataSetHeader };
    byte2__: { assigns: AssignEntry[] }; // max 31bytes of assigns body
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
    byte6: { assignDataStartLocation: Fixed<u8, 24> };
    byte7: { numKeys: u8 }; // 1~128
    byte8: { numLayers: u8 }; // 1~16
    byte9_10: { bodyLength: u8 };
    byte11_23: Reserved;
  };

  type ConfigStorageDataBlobBytes = {
    byte0_23: { headerBytes: ConfigStorageHeaderBytes };
    'byte24_24+N*2-1': { layerAttributes: LayerAttributeWord[] }; // numLayers*2 bytes
    'byte24+N*2__': { keyAssigns: KeyBoundAssignDataSet[] }; // bodyLength bytes
  };
}
