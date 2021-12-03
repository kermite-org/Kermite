import { css, FC, jsx } from 'alumina';
import { Icon } from '~/ui/components';
import { projectKeyboardListCardCommonStyles } from '~/ui/fabrics/ProjectKeyboardList/ProjectKeyboardList.CardCommonStyles';

type Props = {
  onClick: () => void;
};

export const ProjectKeyboardListProjectAddCard: FC<Props> = ({ onClick }) => (
  <div css={style} onClick={onClick}>
    <div className="inner">
      <div className="frame">
        <Icon spec="add" size={32} />
        <div class="texts">
          Add keyboard definition
          <br />
          (*.kmpkg.json)
        </div>
      </div>
    </div>
  </div>
);

const style = css`
  ${projectKeyboardListCardCommonStyles.base};
  cursor: pointer;

  > .inner {
    ${projectKeyboardListCardCommonStyles.inner};
    padding: 6px;

    > .frame {
      height: 100%;
      border: dashed 3px #ccc;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      color: #999;

      > .texts {
        margin-top: 5px;
        line-height: 1.5;
        text-align: center;
      }

      > .button {
        margin-top: 10px;
      }
    }
  }

  &:hover {
    > .inner {
      background: #f6fcff;
    }
  }
`;
