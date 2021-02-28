import { FC, jsx, css } from 'qx';
import { uiTheme } from '~/ui-common/base';
import { CheckBox } from '~/ui-common/components/controls/CheckBox';

interface Props {
  className?: string;
  checked: boolean;
  setChecked(value: boolean): void;
  text: string;
  disabled?: boolean;
  hint?: string;
}

const style = css`
  height: ${uiTheme.unitHeight}px;
  display: flex;
  align-items: center;
  > .inner {
    color: ${uiTheme.colors.clPrimary};
    display: flex;
    align-items: center;
    font-size: 15px;

    > span {
      margin-left: 4px;

      &[data-disabled] {
        opacity: 0.5;
      }
    }
  }
`;

export const CheckBoxLine: FC<Props> = ({
  className,
  checked,
  setChecked,
  text,
  disabled,
  hint,
}) => (
  <div css={style} className={className} data-hint={hint}>
    <div className="inner">
      <CheckBox checked={checked} setChecked={setChecked} disabled={disabled} />
      <span data-disabled={disabled}>{text}</span>
    </div>
  </div>
);
