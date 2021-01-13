import { uiTheme } from '@ui-layouter/base';
import { css } from 'goober';
import { h } from 'qx';

export interface IToggleButtonProps {
  active: boolean;
  setActive(active: boolean): void;
  width?: number;
  disabled?: boolean;
  text: string;
}

const cssToggleButton = (buttonWidth: number | undefined) => css`
  width: ${buttonWidth ? `${buttonWidth}px` : 'inherit'};
  height: ${uiTheme.unitHeight}px;
  font-size: 14px;
  color: ${uiTheme.colors.primary};
  border: solid 1px ${uiTheme.colors.primary};
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &[data-active] {
    background: ${uiTheme.colors.primaryWeaken};
  }

  &[data-disabled] {
    cursor: inherit;
    pointer-events: none;
    opacity: 0.4;
  }
`;

export const ToggleButton = (props: IToggleButtonProps) => {
  const { text, active, setActive, width, disabled } = props;

  return (
    <div
      css={cssToggleButton(width)}
      data-active={active}
      data-disabled={disabled}
      onClick={() => setActive(!active)}
    >
      {text}
    </div>
  );
};
