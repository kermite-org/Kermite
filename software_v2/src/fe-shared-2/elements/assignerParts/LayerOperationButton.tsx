import { jsx, css, FC } from 'alumina';
import { colors } from '~/fe-shared';

type Props = {
  icon: string;
  handler: () => void;
  enabled: boolean;
  hint: string;
};
export const LayerOperationButton: FC<Props> = ({
  icon,
  handler,
  enabled,
  hint,
}) => (
  <div
    class={style}
    onClick={(enabled && handler) || undefined}
    data-disabled={!enabled}
    data-hint={hint}
  >
    <i class={icon} />
  </div>
);

const style = css`
  font-size: 16px;
  width: 26px;
  height: 26px;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
  display: flex;
  justify-content: center;
  align-items: center;

  &[data-disabled] {
    opacity: 0.3;
  }
  color: ${colors.clMainText};
`;
