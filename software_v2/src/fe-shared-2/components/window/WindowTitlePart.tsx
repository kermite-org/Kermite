import { jsx, css, FC } from 'alumina';
import { colors } from '~/fe-shared';

export const WindowTitlePart: FC = () => {
  return (
    <div class={style}>
      {/* <img class="icon" src="appicon.png" /> */}
      <span class="text K">K</span>
      <span class="text">ermite</span>
    </div>
  );
};

const style = css`
  display: flex;
  margin-left: 10px;

  > .text {
    font-size: 20px;
    /* font-weight: bold; */
    color: #fff;

    &.K {
      color: ${colors.clSpecialAccent};
    }
  }
`;
