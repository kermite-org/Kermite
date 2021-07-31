import { css, FC, jsx } from 'qx';

type Props = {
  className?: string;
};

export const OnboadingPanel: FC<Props> = ({ className }) => (
  <div css={style} className={className}></div>
);

const style = css`
  background: #ddd;
  height: 240px;
`;
