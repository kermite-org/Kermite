import { generateNumberSequence } from '~/shared';
import { bhi, blo } from '~/shell/services/keyboardDevice/helpers';
import { RawHidOpcode } from '~/shell/services/keyboardDevice/rawHidOpcode';

export class Packets {
  static connectionOpenedFrame = [RawHidOpcode.ConnectionOpened];
  static connectionClosingFrame = [RawHidOpcode.ConnectionClosing];
  static deviceAttributesRequestFrame = [RawHidOpcode.DeviceAttributesRequest];

  // ------------------------------------------------------------

  static memoryWriteTransactionStartFrame = [
    RawHidOpcode.MemoryWriteTransactionStart,
  ];

  static memoryWriteTransactionEndFrame = [
    RawHidOpcode.MemoryWriteTransactionDone,
  ];

  static makeMemoryWriteOperationFrames(bytes: number[]): number[][] {
    const sz = 64 - 6;
    const numFrames = Math.ceil(bytes.length / sz);

    return generateNumberSequence(numFrames).map((k) => {
      const offset = k * sz;
      const data = bytes.slice(offset, offset + sz);
      return [
        RawHidOpcode.MemoryWriteOperation,
        bhi(offset),
        blo(offset),
        data.length,
        ...data,
      ];
    });
  }

  static makeMemoryChecksumRequestFrame(
    offset: number,
    length: number,
  ): number[] {
    return [
      RawHidOpcode.MemoryChecksumRequest,
      bhi(offset),
      blo(offset),
      bhi(length),
      blo(length),
    ];
  }

  // ------------------------------------------------------------

  static customParametersBulkReadRequestFrame = [
    RawHidOpcode.ParametersReadAllRequest,
  ];

  static customParametersResetRequestFrame = [
    RawHidOpcode.ParametersResetOperation,
  ];

  static makeCustomParametersBulkWriteOperationFrame(data: number[]) {
    return [RawHidOpcode.ParametersWriteAllOperation, ...data];
  }

  static makeCustomParameterSignleWriteOperationFrame(
    index: number,
    value: number,
  ) {
    return [RawHidOpcode.ParameterSingleWriteOperation, index, value];
  }

  // ------------------------------------------------------------

  static makeMuteModeSpecFrame(muted: boolean) {
    return [RawHidOpcode.MuteModeSpec, muted ? 1 : 0];
  }

  static makeSimulatorModeSpecFrame(enabled: boolean) {
    return [RawHidOpcode.SimulationModeSpec, enabled ? 1 : 0];
  }

  static makeSimulatorHidReportFrame(report: number[]) {
    return [RawHidOpcode.SimulationModeOutputHidReportWrite, ...report];
  }
}
