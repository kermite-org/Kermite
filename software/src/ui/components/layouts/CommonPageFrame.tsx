import { css, FC, jsx, QxChildren } from 'qx';
import { uiTheme } from '~/ui/base';

type Props = {
  pageTitle?: string;
  children: QxChildren;
  className?: string;
};

export const CommonPageFrame: FC<Props> = ({
  pageTitle,
  children,
  className,
}) => {
  return (
    <div css={style} className={className}>
      <div className="header" qxIf={!!pageTitle}>
        {pageTitle}
      </div>
      <div className="body">{children}</div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;

  > .header {
  }

  > .body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
  }
`;
