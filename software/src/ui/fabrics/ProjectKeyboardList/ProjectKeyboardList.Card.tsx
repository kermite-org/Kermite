import { css, FC, jsx } from 'alumina';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectKeyboardShapeView } from '~/ui/elements/keyboard/panels';
import { projectKeyboardListCardCommonStyles } from '~/ui/fabrics/ProjectKeyboardList/ProjectKeyboardList.CardCommonStyles';

type Props = {
  project: IProjectKeyboardListProjectItem;
  isCurrent: boolean;
  setCurrent: () => void;
};

export const ProjectKeyboardListCard: FC<Props> = ({
  project,
  isCurrent,
  setCurrent,
}) => (
  <div css={style} className={isCurrent && '--current'} onClick={setCurrent}>
    <div className="inner">
      <div className="header-part">
        <div className="keyboard-name">{project.keyboardName}</div>
      </div>
      <div className="body-part">
        <ProjectKeyboardShapeView keyboardDesign={project.design} />
      </div>
    </div>
  </div>
);

const style = css`
  ${projectKeyboardListCardCommonStyles.base};

  &.--current {
    border: solid 4px #4ac;
  }

  cursor: pointer;

  &:hover {
    border: solid 4px #8ce;
  }

  > .inner {
    ${projectKeyboardListCardCommonStyles.inner};
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;

    > .header-part {
      width: 100%;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;

      > .keyboard-name {
        color: #008;
        font-size: 22px;
      }
    }

    > .body-part {
      height: 120px;
    }
  }
`;
