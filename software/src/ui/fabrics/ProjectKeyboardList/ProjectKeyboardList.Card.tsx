import { css, FC, jsx } from 'qx';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectKeyboardShapeView } from '~/ui/components/keyboard/panels';

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
  width: 240px;
  height: 180px;

  border: solid 4px transparent;

  &.--current {
    border: solid 4px #4ac;
  }

  cursor: pointer;

  &:hover {
    border: solid 4px #8ce;
  }

  > .inner {
    width: 100%;
    height: 100%;
    padding: 10px;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;

    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);

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
