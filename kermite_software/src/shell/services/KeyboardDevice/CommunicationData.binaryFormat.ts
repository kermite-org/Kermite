/* eslint-disable @typescript-eslint/no-unused-vars */

// pseudo type definition for comminucation data format

namespace CommunicationDataBinaryForamt {
  // --------------------
  // types

  // unsigend byte, unsigned short
  type u8 = number;
  type u16 = number;

  type VariableLength = any;
  type Bytes<N> = number[];
  type ZeroPadding = number[];

  type PacketHostToDevice = {};
  type PacketDeviceToHost = {};

  // --------------------
  // config storage data writing

  type PktMemoryWriteTransactionStart = PacketHostToDevice & {
    [0]: { category: 0xb0 }; // 0xb0 for memory operation
    [1]: { dataKind: 0x01 }; // 0x01 for config storage data
    [2]: { command: 0x10 }; // 0x10 for write transaction start
  };

  type PktMemoryWriteTransactionDone = PacketHostToDevice & {
    [0]: { category: 0xb0 }; // 0xb0 for memory operation
    [1]: { dataKind: 0x01 }; // 0x01 for config storage data
    [2]: { command: 0x11 }; // 0x11 for write transaction done
  };

  type PktMemoryWritingOperation = PacketHostToDevice & {
    [0]: { category: 0xb0 }; // 0xb0 for memory operation
    [1]: { dataKind: 0x01 }; // 0x01 for config storage data
    [2]: { command: 0x20 }; // 0x20 for write request
    [3_4]: { address: u16 };
    [5]: { dataLength: u8 };
    '6__': { data: VariableLength }; // dataLength bytes
  };

  type PktMemoryChecksumRequestOperation = PacketHostToDevice & {
    [0]: { category: 0xb0 }; // 0xb0 for memory operation
    [1]: { dataKind: 0x01 }; // 0x01 for config storage data
    [2]: { command: 0x21 }; // 0x21 for checksum request
    [3_4]: { address: u16 };
    [5_6]: { dataLength: u16 };
  };

  type PktMemoryChecksumResponse = PacketDeviceToHost & {
    [0]: { category: 0xb0 }; // 0xb0 for memory operation
    [1]: { dataKind: 0x01 }; // 0x01 for config storage data
    [2]: { command: 0x22 }; // 0x22 for checksum response
    [3]: { checksumValue: u8 };
  };

  // --------------------
  // realtime event

  type PktRealtimeKeyStateEvent = PacketDeviceToHost & {
    [0]: { category: 0xe0 }; // 0xe0 for realtime event
    [1]: { command: 0x90 }; // 0x90 for key state changed
    [2]: { keyIndex: u8 };
    [3]: { isDown: u8 }; // (1:down, 0: up)
  };

  type PktRealtimeLayerStateEvent = PacketDeviceToHost & {
    [0]: { category: 0xe0 }; // 0xe0 for realtime event
    [1]: { command: 0x91 }; // 0x91 for layer changed
    [2_3]: { layerActiveFlags: u16 };
  };

  type __draft__PktRealtimeOperationHitEvent = PacketDeviceToHost & {
    [0]: { category: 0xe0 }; // 0xe0 for realtime event
    [1]: { command: 0x92 }; // 0x92 for operation hit
    [2]: { keyIndex: u8 };
    [3]: { layerIndex: u8 };
    [4]: { operationSlot: u8 }; // [1, 2, 3] for [primary, secondary, tertiary]
  };

  // --------------------
  // general

  type PktDeviceAttributesRequest = PacketHostToDevice & {
    [0]: { category: 0xf0 }; // 0xf0 for general
    [1]: { command: 0x10 }; // 0x10 for device attributes request
  };

  type PktDeviceAttributesResponse = PacketDeviceToHost & {
    [0]: { category: 0xf0 }; // 0xf0 for general
    [1]: { command: 0x11 }; // 0x10 for device attributes response
    [2]: { configStorageRevision: u8 };
    [3]: { numberOfKeys: u8 };
    [4]: { keyboardSide: u8 }; // (0:unset, 1:left, 2:right)
  };

  type __draft__PktKeyboardSideConfiguration = PacketHostToDevice & {
    [0]: { category: 0xf0 }; // 0xf0 for general
    [1]: { command: 0x20 }; // 0x20 for set kebyoard side
    [2]: { keyboardSide: u8 }; // (0:unset, 1:left, 2:right)
  };

  // --------------------
  // device operation

  type PktSpecSideBrainMode = PacketHostToDevice & {
    [0]: { category: 0xd0 }; // 0xd0 for device operation
    [1]: { command: 0x10 }; // 0x10 for side brain mode config
    [2]: { isSideBrainMode: u8 }; // (0:normal, 1:sidebrain)
  };

  type PktSetSideBrainHidReport = PacketHostToDevice & {
    [0]: { category: 0xd0 }; // 0xd0 for device operation
    [1]: { command: 0x20 }; // 0x20 for set sidebrain hid report
    [2_9]: { hidReportBuf: Bytes<8> };
  };

  // DEPRECATED
  // --------------------
  // framing layer
  // --------------------
  // type OnelinerSingleData = {
  //   [0]: { opcode: 0xe0 };
  //   [1]: { reserved: 0x00 };
  //   [2]: { length: u8 }; // length of data bytes
  //   '3__': { dataBytes: VariableLength };
  //   __63: ZeroPadding; // fill to 64bytes
  // };

  // type __draft__OnelinerMultipleData = {
  //   [0]: { opcode: 0xe1 };
  //   '1__': {
  //     [0]: { length: u8 };
  //     '1__': { dataBytes: VariableLength };
  //   }[];
  //   __63: ZeroPadding; // fill to 64bytes
  // };

  // type StartOfFrame = {
  //   [0]: { opcode: 0xf0 };
  //   [1]: { numberOfFrames: u8 };
  //   [2_3]: { totalDataBytesLength: u16 }; // length of whole data bytes
  //   __63: ZeroPadding; // fill to 64bytes
  // };

  // type FrameBody = {
  //   [0]: { opcode: 0xf1 };
  //   [1]: { frameIndex: u8 };
  //   [2]: { dataLength: u8 }; // length of data bytes in this frame
  //   '3__': { dataBytes: VariableLength };
  //   __63: ZeroPadding; // fill to 64bytes
  // };
}
