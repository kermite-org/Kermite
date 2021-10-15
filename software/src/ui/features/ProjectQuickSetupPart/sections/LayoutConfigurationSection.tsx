import { css, FC, jsx } from 'qx';
import {
  createFallbackPersistKeyboardDesign,
  fallbackProfileData,
  generateNumberSequence,
  IKermiteStandardKeyboardSpec,
  IPersistKeyboardDesignRealKeyEntity,
  IProfileData,
  IStandardBaseFirmwareType,
} from '~/shared';
import { PresetKeyboardView } from '~/ui/components';
import { usePresetKeyboardViewModel } from '~/ui/features/PresetBrowser';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { useMemoEx } from '~/ui/utils';

const splitKeyboardTypes: IStandardBaseFirmwareType[] = [
  'AvrSplit',
  'RpSplit',
  'AvrOddSplit',
  'RpOddSplit',
];

function createLayoutFromFirmwareSpec(
  spec: IKermiteStandardKeyboardSpec,
): IProfileData {
  const design = createFallbackPersistKeyboardDesign();
  const isSplit = splitKeyboardTypes.includes(spec.baseFirmwareType);
  if (!isSplit) {
    if (
      spec.useMatrixKeyScanner &&
      spec.matrixRowPins &&
      spec.matrixColumnPins
    ) {
      const nx = spec.matrixColumnPins.length;
      const ny = spec.matrixRowPins.length;
      const num = nx * ny;
      const keys: IPersistKeyboardDesignRealKeyEntity[] =
        generateNumberSequence(num).map((idx) => {
          const ix = idx % nx >> 0;
          const iy = (idx / nx) >> 0;
          return {
            keyId: `key${idx}`,
            x: ix,
            y: iy,
          };
        });
      design.keyEntities.push(...keys);
    }
  }
  return { ...fallbackProfileData, keyboardDesign: design };
}

function useLayoutConfigurationSectionModel() {
  const profileData = useMemoEx(createLayoutFromFirmwareSpec, [
    projectQuickSetupStore.state.firmwareConfig,
  ]);
  return { profileData };
}

export const LayoutConfigurationSection: FC = () => {
  const { profileData } = useLayoutConfigurationSectionModel();
  const keyboardViewModel = usePresetKeyboardViewModel(profileData, '');
  return (
    <SectionFrame title="Layout Preview">
      <div class={style}>
        <PresetKeyboardView {...keyboardViewModel} />
      </div>
    </SectionFrame>
  );
};

const style = css`
  height: 200px;
  border: solid 1px #ccc;
  padding: 5px;
`;
