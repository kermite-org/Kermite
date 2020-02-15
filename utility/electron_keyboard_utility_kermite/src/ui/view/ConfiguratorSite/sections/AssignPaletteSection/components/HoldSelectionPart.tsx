import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry, ILayer, LayerInvocationMode } from '~contract/data';
import { ModifierVirtualKey } from '~model/HighLevelDefs';
import { AssignSlotCard, LayerTriggerAssignSlotCard } from './AssignSlotCards';
import {
  isAssignModifierActive,
  isAssignHoldModifierActive,
  isAssignLayerTrigger
} from '~ui/state/editor';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';

const modifiresGroup: ModifierVirtualKey[] = [
  'K_Shift',
  'K_Ctrl',
  'K_Alt',
  'K_OS'
];

const layerInvocationModes: LayerInvocationMode[] = [
  'hold',
  'oneshot',
  'modal',
  'unmodal'
];

const cssRow = css`
  display: flex;
  > * {
    margin: ${UiTheme.assignPallet.commonHalfMargin};
  }
`;

const HoldLayerSelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  customLayers: ILayer[];
  setCurrentAssignHoldLayer(layerId: string): void;
  setAssignForCurrentSlot(assing: IKeyAssignEntry): void;
}) => {
  const {
    currentAssign,
    customLayers,
    setCurrentAssignHoldLayer,
    setAssignForCurrentSlot
  } = props;

  const layerModeValue =
    (currentAssign?.type === 'holdLayer' &&
      currentAssign.layerInvocationMode) ||
    undefined;

  const onLayerModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const layerInvocationMode = e.currentTarget.value as LayerInvocationMode;
    if (currentAssign && currentAssign.type === 'holdLayer') {
      setAssignForCurrentSlot({ ...currentAssign, layerInvocationMode });
    }
  };

  return (
    <div>
      <div>Layers</div>
      <div css={cssRow}>
        {customLayers.map(la => {
          const isActive = isAssignLayerTrigger(currentAssign, la.layerId);
          return (
            <LayerTriggerAssignSlotCard
              layer={la}
              isActive={isActive}
              onClick={() => setCurrentAssignHoldLayer(la.layerId)}
              key={la.layerId}
            />
          );
        })}
      </div>
      <div>
        <select value={layerModeValue} onChange={onLayerModeChange}>
          {layerInvocationModes.map(mode => (
            <option value={mode} key={mode}>
              {mode}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const HoldModifierSelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  setAssignForCurrentSlot(assing: IKeyAssignEntry): void;
}) => {
  const { currentAssign, setAssignForCurrentSlot } = props;

  const isOneShot =
    (currentAssign &&
      currentAssign.type === 'holdModifier' &&
      currentAssign.isOneShot) ||
    false;

  const onCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentAssign && currentAssign.type === 'holdModifier') {
      setAssignForCurrentSlot({
        ...currentAssign,
        isOneShot: e.currentTarget.checked
      });
    }
  };
  return (
    <div>
      <div>Modifiers</div>
      <div css={cssRow}>
        {modifiresGroup.map(mo => {
          const isActive = isAssignHoldModifierActive(currentAssign, mo);
          const onClick = () => {
            setAssignForCurrentSlot({
              type: 'holdModifier',
              modifierKey: mo,
              isOneShot: false
            });
          };
          return (
            <AssignSlotCard
              virtualKey={mo}
              isActive={isActive}
              onClick={onClick}
              key={mo}
            ></AssignSlotCard>
          );
        })}
      </div>
      <div>
        <label>oneshot</label>
        <input type="checkbox" checked={isOneShot} onChange={onCheckChange} />
      </div>
    </div>
  );
};

export const HoldSelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  customLayers: ILayer[];
  setCurrentAssignHoldLayer(layerId: string): void;
  setAssignForCurrentSlot(assing: IKeyAssignEntry): void;
}) => {
  const cssBox = css`
    flex-shrink: 0;
    padding: ${UiTheme.assignPallet.commonMargin};
  `;

  return (
    <div css={cssBox}>
      <HoldLayerSelectionPart {...props} />
      <HoldModifierSelectionPart {...props} />
    </div>
  );
};
