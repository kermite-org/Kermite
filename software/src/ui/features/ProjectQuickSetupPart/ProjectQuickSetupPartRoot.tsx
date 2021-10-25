import { css, FC, jsx } from 'qx';
import { Link } from '~/ui/base';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepLayoutConfig';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { AssignerPage } from '~/ui/pages/assigner-page';
import { uiReaders } from '~/ui/store';

const ProjectQuickSetupPartRoot: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();
  const { pagePath } = uiReaders;
  const subPath = pagePath.split('/')[2];
  if (subPath === 'step1') {
    return <ProjectQuickSetupPart_StepFirmwareConfig />;
  } else if (subPath === 'step2') {
    return <ProjectQuickSetupPart_StepFirmwareFlash />;
  } else if (subPath === 'step3') {
    return <ProjectQuickSetupPart_StepLayoutConfig />;
  } else if (subPath === 'step4') {
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

    > :last-child {
      margin-left: auto;
    }
  `;
  return (
    <div css={style}>
      <Link to="/projectQuickSetup/step1">step1</Link>
      <Link to="/projectQuickSetup/step2">step2</Link>
      <Link to="/projectQuickSetup/step3">step3</Link>
      <Link to="/projectQuickSetup/step4">step4</Link>
      <Link to="/home">x</Link>
    </div>
  );
};

export const ProjectQuickSetupPageImpl: FC = () => (
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
