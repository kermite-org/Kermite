import { css, FC, jsx } from 'qx';
import { Link } from '~/ui/base';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareFlash';
import { AssignerPage } from '~/ui/pages/assigner-page';
import { uiReaders } from '~/ui/store';

const ProjectQuickSetupPartRoot: FC = () => {
  const { pagePath } = uiReaders;
  const subPath = pagePath.split('/')[2];
  if (subPath === 'step1') {
    return <ProjectQuickSetupPart_StepFirmwareConfig />;
  } else if (subPath === 'step2') {
    return <ProjectQuickSetupPart_StepFirmwareFlash />;
  } else if (subPath === 'step3') {
    return <AssignerPage />;
  }
  return null;
};

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
