import { FC, jsx, css } from 'qx';
import { colors } from '~/ui/base';

interface Props {
  className?: string;
  checked: boolean;
  setChecked(value: boolean): void;
  disabled?: boolean;
}

export const CheckBox: FC<Props> = ({
  className,
  checked,
  setChecked,
  disabled,
}) => (
  <div
    css={style}
    classNames={[className, checked && '--checked', disabled && '--disabled']}
    onClick={() => setChecked(!checked)}
  >
    <i class="fa fa-check mark" />
  </div>
);

const style = css`
  border: solid 1px ${colors.clPrimary};
  background: ${colors.clControlBase};
  color: ${colors.clDecal};
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

  &.--checked {
    background: ${colors.clPrimary};
    > .mark {
      visibility: visible;
    }
  }

  &:hover {
    opacity: 0.7;
  }

  &.--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;
