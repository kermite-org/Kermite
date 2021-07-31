import { css, FC, jsx } from 'qx';

type Props = {
  className?: string;
  handler?: () => void;
};

export const OnboardingPullTab: FC<Props> = ({ className, handler }) => (
  <div css={style} className={className} onClick={handler}>
    ナビ
  </div>
);

const style = css`
  width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: solid 1px #258;
  background: #58c;
  color: #fff;
  border-radius: 8px 0 0 8px;
  padding: 4px 13px;
  cursor: pointer;
  font-size: 16px;
  line-height: 20px;
`;
