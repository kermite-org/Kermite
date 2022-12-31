import { css, FC, jsx } from 'alumina';

export const LoadingAnimationIcon: FC = () => (
  <div class={style}>
    <div class="loading">
      <div class="spinner"></div>
    </div>
  </div>
);

const style = css`
  .spinner {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 12px solid rgba(255, 255, 255, 0.7);
    border-top-color: rgba(0, 0, 0, 0.3);
    animation: circle 1s linear infinite;
  }
  @keyframes circle {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
