/* eslint-disable @typescript-eslint/no-unused-vars */

// pseudo type definition for communication data format

namespace CommunicationDataBinaryFormat {
  // --------------------
  // types

  type u8 = number; // unsigned byte
  type u16 = number; // unsigned short, big endian

  type VariableLength = any;
  type Bytes<N> = number[];
  type BytesOf<N> = number[];

  type PacketHostToDevice = {};
  type PacketDeviceToHost = {};

  type bits<N> = number;
  type Reserved = any;

  // --------------------
  // general

  type PktConnectionOpened = PacketHostToDevice & {
    [0]: { opcode: 0xf0 };
  };

  type PktConnectionClosing = PacketHostToDevice & {
    [0]: { opcode: 0xf1 };
  };

  type PktDeviceAttributesRequest = PacketHostToDevice & {
    [0]: { opcode: 0xf2 };
  };

  type PktDeviceAttributesResponse = PacketDeviceToHost & {
    [0]: { opcode: 0xf3 };
    [1]: { rawHidMessageProtocolRevision: u8 };
    [2]: { configStorageFormatRevision: u8 };
    [3]: { profileBinaryFormatRevision: u8 };
    [4]: { configParametersRevision: u8 };
    [5_7]: { kermiteMcuCode: Bytes<3> };
    [8_13]: { projectId: Bytes<6> };
    [14]: { reserved: u8 };
    [15_20]: { firmwareId: Bytes<6> };
    [21]: { isOnlineProject: u8 };
    [22_23]: { projectReleaseBuildRevision: u16 };
    [24_39]: { variationName: Bytes<16> };
    [40_43]: { deviceInstanceCode: Bytes<4> };
    [44_45]: { variationId: Bytes<2> };
    [46_47]: { reserved: 2 };
    [48_49]: { assignStorageCapacity: u16 };
  };

  // --------------------
  // realtime event

  type PktRealtimeKeyStateEvent = PacketDeviceToHost & {
    [0]: { opcode: 0xa0 };
    [2]: { keyIndex: u8 };
    [3]: { isDown: u8 }; // (1:down, 0: up)
  };

  type PktRealtimeLayerStateEvent = PacketDeviceToHost & {
    [0]: { opcode: 0xa1 };
    [2_3]: { layerActiveFlags: u16 };
  };

  type __draft__PktRealtimeOperationHitEvent = PacketDeviceToHost & {
    [0]: { opcode: -1 };
    [2]: { keyIndex: u8 };
    [3]: { layerIndex: u8 };
    [4]: { operationSlot: u8 }; // [1, 2, 3] for [primary, secondary, tertiary]
  };

  // --------------------
  // config storage data writing

  type PktMemoryWriteTransactionStart = PacketHostToDevice & {
    [0]: { opcode: 0xb0 };
  };

  type PktMemoryWriteTransactionDone = PacketHostToDevice & {
    [0]: { opcode: 0xb1 };
  };

  type PktMemoryWritingOperation = PacketHostToDevice & {
    [0]: { opcode: 0xb2 };
    [1_2]: { offset: u16 };
    [3]: { dataLength: u8 };
    '4__': { data: VariableLength }; // dataLength bytes
  };

  type PktMemoryChecksumRequestOperation = PacketHostToDevice & {
    [0]: { opcode: 0xb3 };
    [1_2]: { offset: u16 };
    [3_4]: { dataLength: u16 };
  };

  type PktMemoryChecksumResponse = PacketDeviceToHost & {
    [0]: { opcode: 0xb4 };
    [1]: { checksumValue: u8 };
  };

  // --------------------
  // custom parameters data read/write

  type PktCustomParametersBulkReadRequest = PacketHostToDevice & {
    [0]: { opcode: 0xc0 };
  };

  type PktCustomParametersBulkReadResponse = PacketDeviceToHost & {
    [0]: { opcode: 0xc1 };
    [1]: { numParameters: u8 };
    [2_3]: { parameterExposeFlags: u16 };
    '4__': { values: BytesOf<'numParameters'> };
    '4+numParameters__': { maxValues: BytesOf<'numParameters'> };
  };

  type PktCustomParametersBulkWriteOperation = PacketHostToDevice & {
    [0]: { opcode: 0xc2 };
    [1]: { parameterIndexBase: u8 };
    [2]: { numParameters: u8 };
    '3__': { data: BytesOf<'numParameters'> };
  };

  type PktCustomParameterSingleWriteOperation = PacketHostToDevice & {
    [0]: { opcode: 0xc3 };
    [1]: { index: u8 }; // paramter index
    [2]: { value: u8 }; // parameter value
  };

  type PktCustomParametersResetOperation = PacketHostToDevice & {
    [0]: { opcode: 0xc4 };
  };

  type PktCustomParameterChangedNotification = PacketDeviceToHost & {
    [0]: { opcode: 0xc5 };
    [1]: { index: u8 }; // paramter index
    [2]: { value: u8 }; // parameter value
  };

  // --------------------
  // device operation

  type PktSpecMuteMode = PacketHostToDevice & {
    [0]: { opcode: 0xd0 };
    [1]: { isMuteMode: u8 }; // (0:normal, 1:muted)
  };

  type PktSpecSimulatorMode = PacketHostToDevice & {
    [0]: { opcode: 0xd1 };
    [1]: { isSimulatorMode: u8 }; // (0:normal, 1:simulator)
  };

  type PktSetSimulatorHidReport = PacketHostToDevice & {
    [0]: { opcode: 0xd2 };
    [1_8]: { hidReportBuf: Bytes<8> };
  };
}
