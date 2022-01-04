import { css, FC, jsx, AluminaChildren } from 'alumina';
import { colors } from '~/ui/base';

type Props = {
  pageTitle?: string;
  children: AluminaChildren;
};

export const CommonPageFrame: FC<Props> = ({ pageTitle, children }) => {
  return (
    <div css={style}>
      <div class="header" if={!!pageTitle}>
        {pageTitle}
      </div>
      <div class="body">{children}</div>
    </div>
  );
};

const style = css`
  background: ${colors.clBackground};
  color: ${colors.clMainText};
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;

  > .header {
    flex-shrink: 0;
  }

  > .body {
    flex-grow: 1;
    margin-top: 10px;
  }
`;
