import { jsx, css, FC } from 'alumina';
import { ILayerDefaultScheme } from '~/app-shared';

type Props = {
  value: ILayerDefaultScheme;
  isCurrent: boolean;
  setCurrent: () => void;
  disabled: boolean;
};

export const DefaultSchemeButton: FC<Props> = ({
  value,
  isCurrent,
  setCurrent,
  disabled,
}) => (
  <div
    class={style}
    data-current={isCurrent}
    onClick={setCurrent}
    data-disabled={disabled}
  >
    {value}
  </div>
);

const style = css`
  min-width: 80px;
  height: 26px;
  padding: 0 8px;
  cursor: pointer;
  border: solid 1px #048;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &[data-current] {
    background: #0cf;
  }
  &:hover {
    opacity: 0.8;
  }

  &[data-disabled] {
    pointer-events: none;
    color: #888;
    background: #ddd;
    border: solid 1px #666;
  }
`;
