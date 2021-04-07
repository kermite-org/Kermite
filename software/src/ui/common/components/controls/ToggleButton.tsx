import { FC, jsx, css } from 'qx';
import { uiTheme } from '~/ui/common';
import { ButtonBase } from '~/ui/common/components';

export interface Props {
  active: boolean;
  setActive(active: boolean): void;
  width?: number;
  disabled?: boolean;
  text: string;
}

const style = (buttonWidth: number | undefined) => css`
  width: ${buttonWidth ? `${buttonWidth}px` : 'inherit'};
  height: ${uiTheme.unitHeight}px;
  font-size: 15px;
  color: ${uiTheme.colors.clPrimary};
  border: solid 1px ${uiTheme.colors.clPrimary};

  &:not(.active) {
    > span {
      opacity: 0.7;
    }
  }

  &.active {
    background: ${uiTheme.colors.clPrimary};
    color: ${uiTheme.colors.clDecal};
  }

  &.disabled {
    opacity: 0.4;
  }
`;

export const ToggleButton: FC<Props> = ({
  text,
  active,
  setActive,
  width,
  disabled,
}) => (
  <ButtonBase
    extraCss={style(width)}
    active={active}
    disabled={disabled}
    onClick={() => setActive(!active)}
  >
    <span>{text}</span>
  </ButtonBase>
);
