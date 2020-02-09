import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry, ILayer } from '~contract/data';
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
    height: 230px;
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
              const isActive = isAssignKeySpecific(currentAssign, vk);
              return (
                <AssignSlotCard
                  isActive={isActive}
                  onClick={() => setCurrentAssignKey(vk)}
                  virtualKey={vk}
                  key={vk}
                ></AssignSlotCard>
              );
            })}
          </div>
        );
      })}
      <div css={cssCardListFrame}>
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
    </div>
  );
};
