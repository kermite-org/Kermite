import { FC, jsx, css } from 'alumina';
import { colors, uiTheme } from '~/ui/base';
import { CheckBox } from '~/ui/components/atoms';

interface Props {
  checked: boolean;
  setChecked(value: boolean): void;
  text: string;
  disabled?: boolean;
  hint?: string;
}

export const CheckBoxLine: FC<Props> = ({
  checked,
  setChecked,
  text,
  disabled,
  hint,
}) => (
  <div class={style} data-hint={hint}>
    <div class="inner">
      <CheckBox checked={checked} setChecked={setChecked} disabled={disabled} />
      <span data-disabled={disabled}>{text}</span>
    </div>
  </div>
);

const style = css`
  height: ${uiTheme.unitHeight}px;
  display: flex;
  align-items: center;
  > .inner {
    color: ${colors.clPrimary};
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
