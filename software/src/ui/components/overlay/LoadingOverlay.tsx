import { css, FC, jsx } from 'qx';
import { LoadingAnimationIcon } from '~/ui/components/atoms/LoadingAnimationIcon';

type Props = {
  isLoading: boolean;
};

const style = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
`;

export const LoadingOverlay: FC<Props> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }
  return (
    <div css={style}>
      <LoadingAnimationIcon />
    </div>
  );
};
