import { css } from 'goober';
import { FC, h } from 'qx';
import { uiTheme } from '~/ui-common/base';
import { CheckBox } from '~/ui-common/components/controls/CheckBox';

interface Props {
  className?: string;
  checked: boolean;
  setChecked(value: boolean): void;
  text: string;
}

const style = css`
  height: ${uiTheme.unitHeight}px;
  display: flex;
  align-items: center;
  > .inner {
    color: ${uiTheme.colors.clPrimary};
    display: flex;
    align-items: flex-end;
    font-size: 15px;

    > :nth-child(2) {
      margin-left: 4px;
    }
  }
`;

export const CheckBoxLine: FC<Props> = ({
  className,
  checked,
  setChecked,
  text,
}) => (
  <div css={style} className={className}>
    <div className="inner">
      <CheckBox checked={checked} setChecked={setChecked} />
      <span>{text}</span>
    </div>
  </div>
);
