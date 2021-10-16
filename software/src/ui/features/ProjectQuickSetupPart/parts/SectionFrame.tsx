import { css, FC, jsx, QxChildren } from 'qx';
import { uiTheme } from '~/ui/base';

type Props = {
  title: string;
  children: QxChildren;
  inactive?: boolean;
};
export const SectionFrame: FC<Props> = ({ title, children, inactive }) => (
  <div css={style} class={inactive && '--inactive'}>
    <div class="title">{title}</div>
    <div class="body">{children}</div>
  </div>
);

const style = css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  padding: 5px;

  &.--inactive {
    opacity: 0.5;
    pointer-events: none;
  }
`;
