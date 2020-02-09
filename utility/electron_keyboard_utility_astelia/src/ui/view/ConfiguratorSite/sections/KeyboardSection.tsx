import { jsx, css } from '@emotion/core';
import { useSelector } from 'react-redux';
import { AppState } from '~ui/state/store';
import { AutoScaledBox } from '~ui/view/SizeMonitoredBox';
import { KeyboardShape } from '~ui/view/WidgetSite/KeyboardShape';
import { getAssignSlotAddress } from '~ui/state/helpers';
import { Dispatch } from 'redux';
import { editorSlice } from '~ui/state/editorSlice';
import { useMapDispatchToProps } from '~ui/hooks';
import { VirtualKeyTexts } from '../Constants';

const mapStateToProps = (state: AppState) => ({
  pressedKeyFlags: state.player.pressedKeyFlags,
  currentSlotAddress: state.editor.currentAssignSlotAddress,
  currentLayerId: state.editor.currentLayerId,
  keyAssigns: state.editor.editModel.keyAssigns
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    selectAssignSlot(keyUnitId: string, isPrimary: boolean) {
      dispatch(editorSlice.actions.selectAssignSlot({ keyUnitId, isPrimary }));
    },
    clearAssignSlotSelection() {
      dispatch(editorSlice.actions.clearAssignSlotSelection());
    }
  };
};

export function KeyboardSection() {
  const {
    pressedKeyFlags,
    currentSlotAddress,
    currentLayerId,
    keyAssigns
  } = useSelector(mapStateToProps);
  const { selectAssignSlot, clearAssignSlotSelection } = useMapDispatchToProps(
    mapDispatchToProps
  );

  const cssSvg = css`
    user-select: none;
  `;

  const cssBody = css`
    fill: #54566f;
  `;
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
      fill: #0f0;
    }
    stroke: #080;
    fill: transparent;
    cursor: pointer;
  `;

  const cssAssignText = css`
    fill: #fff;
    font-size: 8px;
    pointer-events: none;
  `;

  const onBaseClick = () => {
    clearAssignSlotSelection();
  };
  return (
    <AutoScaledBox contentWidth={600} contentHeight={240}>
      <svg
        width="600"
        height="240"
        viewBox="-300 -120 600 240"
        css={cssSvg}
        onClick={onBaseClick}
      >
        <g
          transform="scale(2) translate(0, -53.5)"
          strokeWidth={0.3}
          strokeLinejoin="round"
        >
          <path d={KeyboardShape.outerPathMarkup} css={cssBody} />

          {KeyboardShape.keyPositions.map(ku => {
            const primarySlotAddress = getAssignSlotAddress(
              ku.id,
              currentLayerId,
              true
            );
            const isPressed = pressedKeyFlags[ku.id];
            const isSelected = primarySlotAddress === currentSlotAddress;
            const assign = keyAssigns[primarySlotAddress] || undefined;

            const assignText =
              (assign &&
                assign.type === 'keyInput' &&
                assign.virtualKey !== 'K_NONE' &&
                VirtualKeyTexts[assign.virtualKey]) ||
              '';

            const onClick = (e: React.MouseEvent<SVGRectElement>) => {
              selectAssignSlot(ku.id, true);
              e.stopPropagation();
            };

            return (
              <g
                transform={`translate(${ku.x}, ${ku.y}) rotate(${ku.r}) `}
                key={ku.id}
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
                  x={-6}
                  y={-6}
                  width={12}
                  height={12}
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
          })}
        </g>
      </svg>
    </AutoScaledBox>
  );
}
