import { css, FC, jsx, QxChildren } from 'qx';
import { uiTheme } from '~/ui/base';

type Props = {
  title: string;
  children: QxChildren;
  className?: string;
};
export const SectionFrame: FC<Props> = ({ title, children, className }) => (
  <div css={style} className={className}>
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
