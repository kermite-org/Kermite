import { jsx, css, FC } from 'alumina';
import { Icon } from '~/ui/components/atoms';

type Props = {
  text: string;
  icon: string;
  hint?: string;
  xOffset?: number;
};

export const SectionHeaderText: FC<Props> = ({
  text,
  icon,
  hint,
  xOffset = 0,
}) => (
  <div class={style} data-hint={hint} style={{ marginLeft: `${xOffset}px` }}>
    <Icon spec={icon} size={20} />
    <span>{text}</span>
  </div>
);

const style = css`
  display: flex;
  align-items: center;
  font-size: 18px;
`;
