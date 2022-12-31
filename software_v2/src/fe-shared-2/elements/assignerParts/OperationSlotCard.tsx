import { jsx, css, FC } from 'alumina';
import { colors } from '~/fe-shared';

type Props = {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
  hint: string;
};

export const OperationSlotCard: FC<Props> = ({
  text,
  isCurrent,
  setCurrent,
  hint,
}) => (
  <div
    class={style}
    data-current={isCurrent}
    onClick={setCurrent}
    data-hint={hint}
  >
    {text}
  </div>
);

const style = css`
  min-width: 28px;
  height: 28px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.clAssignCardFace};
  color: ${colors.clAssignCardText};

  &[data-current] {
    background: ${colors.clSelectHighlight};
  }
`;
