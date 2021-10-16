import { css, FC, jsx } from 'qx';
import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  generateNumberSequence,
  IDisplayKeyboardDesign,
  IKermiteStandardKeyboardSpec,
  IPersistKeyboardDesignRealKeyEntity,
  IStandardBaseFirmwareType,
} from '~/shared';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { LayoutPreviewShapeView } from '~/ui/features/ProjectQuickSetupPart/parts/LayoutPreviewShapeView';
import { useMemoEx } from '~/ui/utils';

const splitKeyboardTypes: IStandardBaseFirmwareType[] = [
  'AvrSplit',
  'RpSplit',
  'AvrOddSplit',
  'RpOddSplit',
];

function createLayoutFromFirmwareSpec(
  spec: IKermiteStandardKeyboardSpec,
): IDisplayKeyboardDesign {
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
            keyIndex: idx,
          };
        });
      design.keyEntities.push(...keys);
    }
  }
  return DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
}

function useLayoutConfigurationSectionModel() {
  const design = useMemoEx(createLayoutFromFirmwareSpec, [
    projectQuickSetupStore.state.firmwareConfig,
  ]);
  return { design };
}

export const LayoutConfigurationSection: FC = () => {
  const { design } = useLayoutConfigurationSectionModel();
  return (
    <SectionFrame title="Layout Preview">
      <div class={style}>
        <LayoutPreviewShapeView keyboardDesign={design} />
      </div>
    </SectionFrame>
  );
};

const style = css`
  height: 200px;
  border: solid 1px #ccc;
  padding: 5px;
`;
