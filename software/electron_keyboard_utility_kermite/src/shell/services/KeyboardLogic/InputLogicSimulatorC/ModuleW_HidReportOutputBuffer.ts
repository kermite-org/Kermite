import { createModuleIo } from './LogicSimulatorCCommon';
import { generateNumberSequence } from '~funcs/Utils';

export namespace ModuleW_HidReportOutputBuffer {
  export const io = createModuleIo<number[], number[]>(commitHidReport);

  const local = new (class {
    hidReportQueue: number[][] = [];
    prevInputHidReport: number[] = [];
  })();

  function commitHidReport(hidReport: number[]) {
    //1 --> ! や ! --> 1 など、同一キーでshiftの状態が異なる文字をオーバーラップして入力した場合に、
    //2文字目が入力されない問題の対策
    //HIDレポートの6つのキーコードのスロットが同一で、モディファイヤバイトだけが遷移した場合に
    //一旦全キーのホールドを解除した状態を挟み込む
    if (
      generateNumberSequence(6)
        .map((i) => i + 2)
        .every((i) => hidReport[i] === local.prevInputHidReport[i]) &&
      hidReport[0] !== local.prevInputHidReport[0]
    ) {
      local.hidReportQueue.push([0, 0, 0, 0, 0, 0, 0, 0]);
    }

    local.hidReportQueue.push(hidReport);
    local.prevInputHidReport = hidReport;
  }

  export function processTicker() {
    const hidReport = local.hidReportQueue.shift();
    if (hidReport) {
      io.emit(hidReport);
    }
  }
}
