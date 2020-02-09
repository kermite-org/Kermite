import { css, jsx } from '@emotion/core';
import { VirtualKey } from '~model/HighLevelDefs';
import { VirtualKeyTexts } from '../../../Constants';

export const AssignSlotCard = (props: {
  virtualKey: VirtualKey;
  isActive: boolean;
  onClick: () => void;
}) => {
  const { isActive, onClick, virtualKey: vk } = props;

  const cssAssignSlotCard = css`
    width: 30px;
    height: 30px;
    font-size: 14px;
    background: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    cursor: pointer;

    &[data-active='true'] {
      background: #0a7;
    }

    &.smallFont {
      font-size: 12px;
    }
  `;

  const text = VirtualKeyTexts[vk] || '';

  const className =
    text.length > 2 && !text.match(/^F[0-9]+$/) ? 'smallFont' : '';
  return (
    <div
      css={cssAssignSlotCard}
      className={className}
      data-active={isActive}
      onClick={onClick}
    >
      {text}
    </div>
  );
};
