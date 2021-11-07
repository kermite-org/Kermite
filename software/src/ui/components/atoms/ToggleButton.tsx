import { FC, jsx, css } from 'qx';
import { colors, uiTheme } from '~/ui/base';
import { ButtonBase } from '~/ui/components/atoms/ButtonBase';

interface Props {
  active: boolean;
  setActive(active: boolean): void;
  width?: number;
  disabled?: boolean;
  text: string;
}

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
