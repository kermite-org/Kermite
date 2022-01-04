import { jsx, css, FC } from 'alumina';
import { colors } from '~/ui/base';

export const WindowTitlePart: FC = () => {
  return (
    <div css={style}>
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
