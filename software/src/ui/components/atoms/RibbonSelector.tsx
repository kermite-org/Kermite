import { FC, jsx, css } from 'alumina';
import { uiTheme, ISelectorOption, colors } from '~/ui/base';

interface Props {
  options: ISelectorOption[];
  value: string;
  setValue(value: string): void;
  buttonWidth?: number;
  className?: string;
  disabled?: boolean;
  hint?: string;
}

export const RibbonSelector: FC<Props> = ({
  options,
  value,
  setValue,
  className,
  buttonWidth = 60,
  disabled,
  hint,
}) => (
  <div
    css={style(buttonWidth)}
    class={className}
    data-disabled={disabled}
    data-hint={hint}
  >
    {options.map((item) => (
      <div
        key={item.value}
        class="strip"
        data-active={item.value === value}
        onClick={() => setValue(item.value)}
      >
        <span class="text">{item.label}</span>
      </div>
    ))}
  </div>
);

const style = (buttonWidth: number) => css`
  display: flex;

  > .strip {
    border: solid 1px ${colors.clPrimary};
    background: ${colors.clControlBase};
    color: ${colors.clPrimary};
    border-radius: ${uiTheme.controlBorderRadius}px;
    width: ${buttonWidth ? `${buttonWidth}px` : 'inherit'};
    height: ${uiTheme.unitHeight}px;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    &:not(:first-child) {
      border-left: none;
    }

    > .text {
      opacity: 0.7;
    }

    &[data-active] {
      background: ${colors.clPrimary};
      color: ${colors.clDecal};
      > .text {
        opacity: 1;
      }
    }

    &:hover {
      opacity: 0.7;
    }

    transition: ${uiTheme.commonTransitionSpec};
  }

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }
`;
