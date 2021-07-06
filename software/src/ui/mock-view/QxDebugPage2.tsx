import { css, FC, jsx } from 'qx';

const cssBase = css`
  padding: 10px;
  color: blue;
`;
export const QxDebugPage2: FC = () => {
  console.log(`render`);
  return <div css={cssBase}>Hello</div>;
};
