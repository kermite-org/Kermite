import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { IOperationCardViewModel } from './OperationEditPart.model';

export const OperationCard = (props: { model: IOperationCardViewModel }) => {
  const { text, isCurrent, setCurrent, isEnabled } = props.model;

  const isTextLong = text.length >= 2;

  const cssCard = css`
    min-width: 28px;
    height: 28px;
    background: ${uiTheme.colors.clAssignCardFace};
    color: ${uiTheme.colors.clAssignCardText};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 2px;
    cursor: pointer;
    font-size: ${isTextLong ? '12px' : '15px'};

    &[data-current] {
      background: ${uiTheme.colors.clSelectHighlight};
    }

    &[data-disabled] {
      opacity: 0.3;
      cursor: default;
      pointer-events: none;
    }
  `;

  return (
    <div
      css={cssCard}
      data-current={isCurrent}
      onMouseDown={setCurrent}
      data-disabled={!isEnabled}
    >
      {text}
    </div>
  );
};
