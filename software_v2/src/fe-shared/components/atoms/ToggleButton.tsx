import { FC, jsx, css, AluminaChildren } from 'alumina';
import { colors, uiTheme } from '~/app-shared';
import { ButtonBase } from './ButtonBase';

interface Props {
  active: boolean;
  setActive(active: boolean): void;
  width?: number;
  disabled?: boolean;
  text?: string;
  children?: AluminaChildren;
}

export const ToggleButton: FC<Props> = ({
  text,
  children,
  active,
  setActive,
  width,
  disabled,
}) => (
  <ButtonBase
    class={style(width)}
    active={active}
    disabled={disabled}
    onClick={() => setActive(!active)}
  >
    <span if={text !== undefined}>{text}</span>
    {children}
  </ButtonBase>
);

const style = (buttonWidth: number | undefined) => css`
  width: ${buttonWidth ? `${buttonWidth}px` : 'inherit'};
  height: ${uiTheme.unitHeight}px;
  font-size: 15px;
  color: ${colors.clPrimary};
  border: solid 1px ${colors.clPrimary};

  &:not(.active) {
    > span {
      opacity: 0.7;
    }
  }

  &.active {
    background: ${colors.clPrimary};
    color: ${colors.clDecal};
  }

  &.disabled {
    opacity: 0.4;
  }
`;
