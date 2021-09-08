import { IProjectPresetEntry, IProjectLayoutEntry } from '~/shared';
import { uiReaders } from '~/ui/commonStore';

export const projectResourceHelpers = {
  getPresetEntry(presetName: string): IProjectPresetEntry {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.presets.find((it) => it.presetName === presetName)!;
  },
  getLayoutEntry(layoutName: string): IProjectLayoutEntry {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.layouts.find((it) => it.layoutName === layoutName)!;
  },
  getFirmwareEntry(firmwareName: string) {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.firmwares.find(
      (it) => it.variationName === firmwareName,
    );
  },
};
