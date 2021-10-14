import { css, FC, jsx, QxChildren } from 'qx';
import { uiTheme } from '~/ui/base';

type Props = {
  title: string;
  children: QxChildren;
};
export const SectionFrame: FC<Props> = ({ title, children }) => (
  <div css={style}>
    <div class="title">{title}</div>
    <div class="body">{children}</div>
  </div>
);

const style = css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 5px;
`;
