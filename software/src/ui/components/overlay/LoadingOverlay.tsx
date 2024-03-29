import { css, FC, jsx } from 'alumina';
import { LoadingAnimationIcon } from '~/ui/components/atoms/LoadingAnimationIcon';

type Props = {
  isLoading: boolean;
};

export const LoadingOverlay: FC<Props> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }
  return (
    <div class={style}>
      <LoadingAnimationIcon />
    </div>
  );
};

const style = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
`;
