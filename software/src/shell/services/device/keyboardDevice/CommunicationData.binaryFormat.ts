/* eslint-disable @typescript-eslint/no-unused-vars */

// pseudo type definition for comminucation data format

namespace CommunicationDataBinaryForamt {
  // --------------------
  // types

  type u8 = number; // unsigend byte
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
    [1_2]: { projectReleaseBuildRevision: u16 };
    [3]: { configStorageFormatRevision: u8 };
    [4]: { rawHidMessageProtocolRevision: u8 };
    [5_10]: { projectId: Bytes<6> };
    [11_12]: { __reserved: Bytes<2> };
    [13]: { isOnlineProject: u8 };
    [14]: { padding: u8 };
    [15_22]: { deviceInstanceCode: Bytes<8> };
    [23_24]: { assignStorageCapacity: u16 };
    [25_40]: { variationName: Bytes<16> };
    [41_48]: { kermiteMcuCode: Bytes<8> };
    [49]: { profileBinaryFormatRevision: u8 };
    [50]: { configParametersRevision: u8 };
  };

  type PktDeviceInstanceCodeWriteOperation = PacketHostToDevice & {
    [0]: { opcode: 0xf4 };
    [1_8]: { data: Bytes<8> };
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
  // custom paramters data read/write

  type PktCustomParametersBulkReadRequest = PacketHostToDevice & {
    [0]: { opcode: 0xc0 };
  };

  type PktCustomParametersBulkReadResponse = PacketDeviceToHost & {
    [0]: { opcode: 0xc1 };
    [1]: { numParameters: u8 };
    '2__': { values: BytesOf<'numParameters'> };
    '2+numParameters__': { maxValues: BytesOf<'numParameters'> };
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
