import { css, jsx } from '@emotion/core';
import React from 'react';
import { IKeyUnitCardViewModel } from '../Types';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';

export const KeyUnitCard = (props: { keyUnit: IKeyUnitCardViewModel }) => {
  const {
    keyUnitId,
    pos,
    isPressed,
    isSelected,
    assignText,
    isExtendedAssign,
    selectionHandler
  } = props.keyUnit;

  const onClick = (e: React.MouseEvent<SVGRectElement>) => {
    selectionHandler();
    e.stopPropagation();
  };

  const cssKey = css`
    fill: #2c2d33;

    &[data-pressed='true'] {
      fill: #f80;
    }

    &.selected {
    }
  `;

  const cssSlot = css`
    &[data-selected='true'] {
      fill: ${UiTheme.clSelectHighlight};
    }
    /* stroke: #080; */
    fill: transparent;
    cursor: pointer;
  `;

  const cssAssignText = css`
    fill: #fff;
    font-size: ${isExtendedAssign ? '5px' : '8px'};
    pointer-events: none;
  `;

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
    >
      <rect
        css={cssKey}
        data-pressed={isPressed}
        x={-9}
        y={-9}
        width={18}
        height={18}
      />
      <rect
        data-selected={isSelected}
        x={-9}
        y={-9}
        width={18}
        height={18}
        css={cssSlot}
        onClick={onClick}
      />
      <text
        css={cssAssignText}
        x={0}
        y={3}
        textAnchor="middle"
        dominantBaseline="center"
      >
        {assignText}
      </text>
    </g>
  );
};
