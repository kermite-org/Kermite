import { css } from 'goober';
import { FC, h } from 'qx';
import { uiTheme } from '~/ui-common/base';

interface Props {
  className?: string;
  checked: boolean;
  setChecked(value: boolean): void;
}

const style = css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  background: ${uiTheme.colors.clControlBase};
  color: ${uiTheme.colors.clDecal};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  font-size: 14px;
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
`;

export const CheckBox: FC<Props> = ({ className, checked, setChecked }) => (
  <div
    css={style}
    className={className}
    data-checked={checked}
    onClick={() => setChecked(!checked)}
  >
    <i class="fa fa-check mark" />
  </div>
);
