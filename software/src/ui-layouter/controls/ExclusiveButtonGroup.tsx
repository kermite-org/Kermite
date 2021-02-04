import { css } from 'goober';
import { h } from 'qx';
import { makeCssColor, uiTheme } from '~/ui-layouter/base';
import { ISelectOption } from './interfaces';

export interface IExclusiveButtonGroup {
  options: ISelectOption[];
  value: string;
  setValue(key: string): void;
  buttonWidth?: number;
  disabled?: boolean;
}

const cssExclusiveButtonGroup = (buttonWidth: number | undefined) => css`
  display: flex;

  > .button + .button {
    margin-left: 4px;
  }

  > .button {
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
      background: ${makeCssColor(0xaaaaaa, 0.2)};
      color: ${makeCssColor(0x888888, 0.5)};
      border-color: ${makeCssColor(0x888888, 0.5)};
      cursor: inherit;
      pointer-events: none;
    }
  }
`;

export const ExclusiveButtonGroup = (props: IExclusiveButtonGroup) => {
  const { options, value, setValue, buttonWidth, disabled } = props;

  return (
    <div css={cssExclusiveButtonGroup(buttonWidth)}>
      {options.map((option) => (
        <div
          key={option.value}
          class="button"
          data-active={option.value === value}
          data-disabled={disabled}
          onClick={() => setValue(option.value)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};
