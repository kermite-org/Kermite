import { css } from 'goober';
import { FC, h } from 'qx';
import { uiTheme } from '~/ui-common/base';

interface Props {
  className?: string;
  checked: boolean;
  setChecked(value: boolean): void;
  disabled?: boolean;
}

const style = css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  background: ${uiTheme.colors.clControlBase};
  color: ${uiTheme.colors.clDecal};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  font-size: 12px;
  cursor: pointer;

  > .mark {
    visibility: hidden;
  }

  &[data-checked] {
    background: ${uiTheme.colors.clPrimary};
    > .mark {
      visibility: visible;
    }
  }

  &:hover {
    opacity: 0.7;
  }

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }
`;

export const CheckBox: FC<Props> = ({
  className,
  checked,
  setChecked,
  disabled,
}) => (
  <div
    css={style}
    className={className}
    data-checked={checked}
    onClick={() => setChecked(!checked)}
    data-disabled={disabled}
  >
    <i class="fa fa-check mark" />
  </div>
);
