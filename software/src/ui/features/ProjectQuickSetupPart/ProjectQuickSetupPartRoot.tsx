import { css, FC, jsx } from 'qx';
import { Link } from '~/ui/base';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepLayoutConfig';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { AssignerPage } from '~/ui/pages/assigner-page';
import { uiReaders } from '~/ui/store';

const helpers = {
  getCurrentStep(): 'step1' | 'step2' | 'step3' | 'step4' {
    return uiReaders.pagePath.split('/')[2] as any;
  },
  getCurrentStepNumber(): number {
    return parseInt(helpers.getCurrentStep());
  },
};

const ProjectQuickSetupPartRoot: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();
  const step = helpers.getCurrentStep();
  if (step === 'step1') {
    return <ProjectQuickSetupPart_StepFirmwareConfig />;
  } else if (step === 'step2') {
    return <ProjectQuickSetupPart_StepFirmwareFlash />;
  } else if (step === 'step3') {
    return <ProjectQuickSetupPart_StepLayoutConfig />;
  } else if (step === 'step4') {
    return <AssignerPage />;
  }
  return null;
};

const StepBar: FC = () => {
  const style = css`
    height: 30px;
    display: flex;
    align-items: center;
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

const DirectionBar: FC = () => {
  const style = css`
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  `;
  return (
    <div css={style}>
      <button>back</button>
      <button>next</button>
    </div>
  );
};

export const ProjectQuickSetupPageImpl: FC = () => (
  <div className={style}>
    <StepBar />
    <ProjectQuickSetupPartRoot />
    <DirectionBar />
  </div>
);

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
