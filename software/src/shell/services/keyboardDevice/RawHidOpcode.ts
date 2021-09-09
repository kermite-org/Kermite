export const RawHidOpcode = {
  ConnectionOpened: 0xf0,
  ConnectionClosing: 0xf1,
  DeviceAttributesRequest: 0xf2,
  DeviceAttributesResponse: 0xf3,

  RealtimeKeyStateEvent: 0xa0,
  RealtimeLayerStateEvent: 0xa1,

  MemoryWriteTransactionStart: 0xb0,
  MemoryWriteTransactionDone: 0xb1,
  MemoryWriteOperation: 0xb2,
  MemoryChecksumRequest: 0xb3,
  MemoryChecksumResponse: 0xb4,

  ParametersReadAllRequest: 0xc0,
  ParametersReadAllResponse: 0xc1,
  ParametersWriteAllOperation: 0xc2,
  ParameterSingleWriteOperation: 0xc3,
  ParametersResetOperation: 0xc4,
  ParameterChangedNotification: 0xc5,

  MuteModeSpec: 0xd0,
  SimulationModeSpec: 0xd1,
  SimulationModeOutputHidReportWrite: 0xd2,
};
