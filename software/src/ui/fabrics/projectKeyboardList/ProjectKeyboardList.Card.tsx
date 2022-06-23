import { css, FC, jsx } from 'alumina';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectKeyboardShapeView } from '~/ui/elements/keyboard/panels';
import { OnlineAttrsPart } from '~/ui/fabrics/projectKeyboardList/OnlineAttrsPart';
import { projectKeyboardListCardCommonStyles } from '~/ui/fabrics/projectKeyboardList/ProjectKeyboardList.CardCommonStyles';

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
  <div class={[style, isCurrent && '--current']} onClick={setCurrent}>
    <div class="inner">
      <div class="header-part">
        <div class="keyboard-name">{project.keyboardName}</div>
      </div>
      <div class="body-part">
        <ProjectKeyboardShapeView keyboardDesign={project.design} />
      </div>
      {project.onlineProjectAttrs && (
        <OnlineAttrsPart attrs={project.onlineProjectAttrs} />
      )}
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
    padding: 5px 10px;
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
      height: 100px;
    }
  }
`;
