import { jsx, css, FC } from 'qx';
import { Icon } from '~/ui/components';

type Props = {
  text: string;
  icon: string;
  hint?: string;
};

export const SectionHeaderText: FC<Props> = ({ text, icon, hint }) => (
  <div css={style} data-hint={hint}>
    <Icon spec={icon} size={20} />
    <span>{text}</span>
  </div>
);

const style = css`
  display: flex;
  align-items: center;
  padding: 6px 4px 4px;
  font-size: 18px;
`;
