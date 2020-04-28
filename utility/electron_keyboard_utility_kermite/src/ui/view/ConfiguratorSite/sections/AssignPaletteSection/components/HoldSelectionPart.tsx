import { css, jsx } from '@emotion/core';
import { AssignSlotCard, LayerTriggerAssignSlotCard } from './AssignSlotCards';
import {
  isAssignModifierActive,
  isAssignHoldModifierActive,
  isAssignLayerTrigger
} from '~ui/state/editor';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';
import { ModifierVirtualKey } from '~defs/VirtualKeys';
import {
  LayerInvocationMode,
  IKeyAssignEntry,
  ILayer
} from '~defs/ProfileData';

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
    (currentAssign?.type === 'layerCall' && currentAssign.invocationMode) ||
    undefined;

  const onLayerModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invocationMode = e.currentTarget.value as LayerInvocationMode;
    if (currentAssign && currentAssign.type === 'layerCall') {
      setAssignForCurrentSlot({ ...currentAssign, invocationMode });
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
      currentAssign.type === 'modifierCall' &&
      currentAssign.isOneShot) ||
    false;

  const onCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentAssign && currentAssign.type === 'modifierCall') {
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
              type: 'modifierCall',
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
