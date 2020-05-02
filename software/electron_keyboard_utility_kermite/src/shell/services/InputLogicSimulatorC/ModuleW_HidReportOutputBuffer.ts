import { appGlobal } from '../appGlobal';

export namespace ModuleW_HidReportOutputBuffer {
  const local = new (class {
    hidReportQueue: number[][] = [];
    prevInputHidReport: number[] = [];
  })();

  export function commitHidReport(hidReport: number[]) {
    // fix modifier transition delay problem
    //[ 2, 0, 0, ...] (shift hold)
    //[ 0, 0, 0, ...] (nothing hold) <--- will be added here
    //[ 0, 0, X, ...] (key X hold)
    //* insert nothing hold report state when modifier key removed and some key added
    if (
      local.prevInputHidReport[0] &&
      !hidReport[0] &&
      hidReport.slice(2).some((val) => val > 0)
    ) {
      local.hidReportQueue.push([0, 0, 0, 0, 0, 0, 0, 0]);
    }
    local.hidReportQueue.push(hidReport);
    local.prevInputHidReport = hidReport;
  }

  export function processTicker() {
    const hidReport = local.hidReportQueue.shift();
    if (hidReport) {
      appGlobal.deviceService.writeSideBrainHidReport(hidReport);
    }
  }
}
