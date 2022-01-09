import { jsx, css, FC } from 'alumina';
import { colors } from '~/ui/base';
import { WindowTitlePart } from '~/ui/components';
import { WindowControlButtonsPart } from '~/ui/root/organisms';

export const WindowTitleBarSection: FC = () => (
  <div class={style}>
    <WindowTitlePart />
    <WindowControlButtonsPart />
  </div>
);

const style = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  background: ${colors.clWindowBar};
`;
