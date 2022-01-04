import { css, FC, jsx, styled } from 'alumina';

type Props = {
  handler?: () => void;
};

export const SetupNavigationPullTab: FC<Props> = ({ handler }) => (
  <div css={style} onClick={handler}>
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
  user-select: none;
`;

export const SetupNavigationPullTabPlacer = styled.div`
  position: absolute;
  top: 80px;
  right: -2px;
`;
