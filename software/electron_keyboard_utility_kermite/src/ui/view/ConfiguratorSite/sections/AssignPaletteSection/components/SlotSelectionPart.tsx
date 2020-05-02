import { css, jsx } from '@emotion/core';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';
import { AssignModeButtonRaw } from './AssignSlotCards';
import { extractAssignSlotAddress } from '~ui/state/editor';
import React from 'react';

export const SlotSelectionPart = (props: {
  isSlotSelected: boolean;
  currentSlotAddress: string;
  selectAssignSlot(keyUnitId: string, isPrimary: boolean): void;
}) => {
  const { isSlotSelected, currentSlotAddress, selectAssignSlot } = props;

  const { keyUnitId, isPrimary: isPrimaryCurrent } = React.useMemo(() => {
    const res = extractAssignSlotAddress(currentSlotAddress);
    if (!res) {
      return {
        keyUnitId: '',
        isPrimary: true
      };
    }
    const { keyUnitId, isPrimary } = res;
    return { keyUnitId, isPrimary };
  }, [currentSlotAddress]);

  const onSlotButton = (isPrimary: boolean) => {
    if (keyUnitId) {
      selectAssignSlot(keyUnitId, isPrimary);
    }
  };

  const cssBox = css`
    flex-shrink: 0;
    > * {
      margin: ${UiTheme.assignPallet.commonMargin};
    }
  `;

  const isPrimaryActive = isSlotSelected && isPrimaryCurrent;
  const isSecondaryActive = isSlotSelected && !isPrimaryCurrent;

  return (
    <div css={cssBox}>
      <AssignModeButtonRaw
        text="pri"
        isActive={isPrimaryActive}
        onClick={() => onSlotButton(true)}
      />
      <AssignModeButtonRaw
        text="sec"
        isActive={isSecondaryActive}
        onClick={() => onSlotButton(false)}
      />
    </div>
  );
};
