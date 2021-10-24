import { css, FC, jsx } from 'qx';
import { Link } from '~/ui/base';
import { ProjectQuickSetupPartRoot } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartRoot';

const StepBar: FC = () => {
  const style = css`
    display: flex;
    gap: 10px;
    padding: 0 10px;

    > div {
      cursor: pointer;
    }
  `;
  return (
    <div css={style}>
      <Link to="/home">home</Link>
      <Link to="/projectQuickSetup/step1">step1</Link>
      <Link to="/projectQuickSetup/step2">step2</Link>
      <Link to="/projectQuickSetup/step3">step3</Link>
    </div>
  );
};

export const ProjectQuickSetupPage: FC = () => (
  <div className={style}>
    <StepBar />
    <ProjectQuickSetupPartRoot />
  </div>
);

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
