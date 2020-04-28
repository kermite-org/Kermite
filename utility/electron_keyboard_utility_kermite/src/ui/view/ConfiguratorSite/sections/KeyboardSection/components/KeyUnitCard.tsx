import { css, jsx } from '@emotion/core';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';
import { IKeyUnitCardViewModel } from '../Data';

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
  fill: transparent;
  cursor: pointer;
`;

export const KeyUnitCard = (props: { keyUnit: IKeyUnitCardViewModel }) => {
  const {
    keyUnitId,
    pos,
    isPressed,
    primaryAssign,
    secondaryAssign,
    selectionHandler
  } = props.keyUnit;

  const onClick = (e: React.MouseEvent<SVGRectElement>) => {
    selectionHandler();
    e.stopPropagation();
  };

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
        data-selected={primaryAssign.isSelected}
        x={-9}
        y={-9}
        width={18}
        height={18}
        css={cssSlot}
        onMouseDown={onClick}
      />

      {/* <rect
        data-selected={secondaryAssign.isSelected}
        x={-9}
        y={4}
        width={18}
        height={5}
        css={cssSlot}
      /> */}

      <text
        css={css`
          fill: #fff;
          font-size: ${primaryAssign.isExtendedAssign ? '5px' : '8px'};
          pointer-events: none;
        `}
        x={0}
        y={3}
        textAnchor="middle"
        dominantBaseline="center"
      >
        {primaryAssign.assignText}
      </text>

      {/* <text
        css={css`
          fill: #fff;
          font-size: ${secondaryAssign.isExtendedAssign ? '5px' : '8px'};
          pointer-events: none;
        `}
        x={0}
        y={8}
        textAnchor="middle"
        dominantBaseline="center"
      >
        {secondaryAssign.assignText}
      </text> */}
    </g>
  );
};
