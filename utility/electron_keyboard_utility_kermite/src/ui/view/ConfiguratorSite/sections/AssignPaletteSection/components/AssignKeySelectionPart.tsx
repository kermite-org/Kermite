import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry, ILayer } from '~defs/data';
import { VirtualKey } from '~model/HighLevelDefs';
import { AssignSlotCard, LayerTriggerAssignSlotCard } from './AssignSlotCards';
import { isAssignKeySpecific, isAssignLayerTrigger } from '~ui/state/editor';
import { assignKeyGroupsTable } from './AssignKeySelectionPart_keyGroupsTable';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';

export const AssignKeySelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  customLayers: ILayer[];
  setCurrentAssignKey(virtualKey: VirtualKey): void;
  setCurrentAssignHoldLayer(layerId: string): void;
}) => {
  const {
    currentAssign,
    setCurrentAssignKey,
    customLayers,
    setCurrentAssignHoldLayer
  } = props;

  const cssBox = css`
    flex-grow: 1;

    overflow-y: auto;
    height: 100%;
    padding: ${UiTheme.assignPallet.commonHalfMargin};
  `;

  const cssCardListFrame = css`
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    > * {
      margin: ${UiTheme.assignPallet.commonHalfMargin};
    }
  `;

  return (
    <div css={cssBox}>
      {assignKeyGroupsTable.map((srcTable, index) => {
        return (
          <div css={cssCardListFrame} key={index}>
            {srcTable.map(vk => {
              if (vk === 'K_Shift') {
                const isActive = isAssignLayerTrigger(currentAssign, 'la1');
                const onClick = () => setCurrentAssignHoldLayer('la1');
                return (
                  <AssignSlotCard
                    isActive={isActive}
                    onClick={onClick}
                    virtualKey={vk}
                    key={vk}
                  ></AssignSlotCard>
                );
              } else {
                const isActive = isAssignKeySpecific(currentAssign, vk);
                const onClick = () => setCurrentAssignKey(vk);
                return (
                  <AssignSlotCard
                    isActive={isActive}
                    onClick={onClick}
                    virtualKey={vk}
                    key={vk}
                  ></AssignSlotCard>
                );
              }
            })}
          </div>
        );
      })}
    </div>
  );
};
