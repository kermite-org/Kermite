import { css } from 'goober';
import { makeCssColor } from '~/base/ColorHelper';
import { uiTheme } from '~/base/uiTheme';
import { h } from '~/qx';

export interface IExclusiveButtonGroup {
  options: {
    id: string;
    text: string;
  }[];
  choiceId: string;
  setChoiceId(key: string): void;
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
  const { options, choiceId, setChoiceId, buttonWidth, disabled } = props;

  return (
    <div css={cssExclusiveButtonGroup(buttonWidth)}>
      {options.map((option) => (
        <div
          key={option.id}
          class="button"
          data-active={option.id === choiceId}
          data-disabled={disabled}
          onClick={() => setChoiceId(option.id)}
        >
          {option.text}
        </div>
      ))}
    </div>
  );
};
