import { css, FC, jsx, QxChildren } from 'qx';
import { colors } from '~/ui/base';

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
