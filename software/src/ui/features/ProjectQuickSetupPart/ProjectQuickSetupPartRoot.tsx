import { css, FC, jsx } from 'qx';
import { isNumberInRange } from '~/shared';
import { Link } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepLayoutConfig';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { AssignerPage } from '~/ui/pages/assigner-page';
import { uiActions, uiReaders } from '~/ui/store';

type IProjectQuickSetupStep = 'step1' | 'step2' | 'step3' | 'step4';

const stepInstructionMap: { [step in IProjectQuickSetupStep]: string } = {
  step1: 'Firmware Configuration',
  step2: 'Device Setup',
  step3: 'Layout Template Settings',
  step4: 'Profile Setup',
};

const helpers = {
  shiftStep(
    step: IProjectQuickSetupStep,
    dir: number,
  ): IProjectQuickSetupStep | undefined {
    const nextStepNumber = parseInt(step.replace('step', ''), 10) + dir;
    if (isNumberInRange(nextStepNumber, 1, 4)) {
      return `step${nextStepNumber}` as IProjectQuickSetupStep;
    }
    return undefined;
  },
};

const readers = {
  get currentStep(): IProjectQuickSetupStep {
    return uiReaders.pagePath.split('/')[2] as IProjectQuickSetupStep;
  },
  get currentStepNumber(): number {
    return parseInt(readers.currentStep);
  },
  get canGoNext(): boolean {
    const { currentStep } = readers;
    const { isConfigValid } = projectQuickSetupStore.state;
    if (currentStep === 'step1') {
      return isConfigValid;
    } else {
      return true;
    }
  },
};

const actions = {
  gotoStep(step: IProjectQuickSetupStep) {
    uiActions.navigateTo(`/projectQuickSetup/${step}`);
  },
  handleBackButton() {
    const { currentStep } = readers;
    const previousStep = helpers.shiftStep(currentStep, -1);
    if (previousStep) {
      actions.gotoStep(previousStep);
    } else {
      uiActions.navigateTo('/home');
    }
  },
  async handleNextButton() {
    const { currentStep } = readers;
    if (currentStep === 'step1') {
      actions.gotoStep('step2');
    } else if (currentStep === 'step2') {
      actions.gotoStep('step3');
    } else if (currentStep === 'step3') {
      await projectQuickSetupStore.actions.createProfile();
      actions.gotoStep('step4');
    } else if (currentStep === 'step4') {
      uiActions.navigateTo('/assigner');
    }
  },
};

const ProjectQuickSetupPartRoot: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();
  const { currentStep: step } = readers;
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

const WizardTopBar: FC = () => {
  const { currentStep } = readers;
  const instructionText = stepInstructionMap[currentStep];
  const style = css`
    height: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px 0 5px;

    > div {
      cursor: pointer;
    }

    > :first-child {
      margin-right: auto;
    }

    > :last-child {
      margin-left: 10px;
    }
  `;
  return (
    <div css={style}>
      <div>
        {currentStep}: {instructionText}
      </div>
      <Link to="/projectQuickSetup/step1">step1</Link>
      <Link to="/projectQuickSetup/step2">step2</Link>
      <Link to="/projectQuickSetup/step3">step3</Link>
      <Link to="/projectQuickSetup/step4">step4</Link>
      <Link to="/home">x</Link>
    </div>
  );
};

const WizardFooterBar: FC = () => {
  const { currentStep, canGoNext } = readers;
  const isFirstStep = currentStep === 'step1';
  const isFinalStep = currentStep === 'step4';

  const { handleBackButton, handleNextButton } = actions;

  const style = css`
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  `;
  return (
    <div css={style}>
      <GeneralButton onClick={handleBackButton}>
        {isFirstStep ? 'cancel' : 'back'}
      </GeneralButton>
      <GeneralButton onClick={handleNextButton} disabled={!canGoNext}>
        {!isFinalStep ? 'next' : 'complete'}
      </GeneralButton>
    </div>
  );
};

export const ProjectQuickSetupPageImpl: FC = () => (
  <div className={style}>
    <WizardTopBar />
    <ProjectQuickSetupPartRoot />
    <WizardFooterBar />
  </div>
);

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
