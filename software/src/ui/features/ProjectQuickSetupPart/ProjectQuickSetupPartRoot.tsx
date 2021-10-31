import { css, FC, jsx } from 'qx';
import { isNumberInRange } from '~/shared';
import { colors, Link } from '~/ui/base';
import { SetupNavigationStepShiftButton } from '~/ui/components';
import { SetupNavigationStepButton } from '~/ui/components/atoms/SetupNavigationStepButton';
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
  canGoToStep(_step: IProjectQuickSetupStep): boolean {
    const { currentStep } = readers;
    const { isConfigValid } = projectQuickSetupStore.state;
    if (currentStep === 'step1') {
      return isConfigValid;
    } else {
      return true;
    }
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
  cancelSteps() {
    uiActions.navigateTo('/home');
  },
  completeSteps() {
    uiActions.navigateTo('/assigner');
  },
  shiftStepPrevious() {
    const { currentStep } = readers;
    const previousStep = helpers.shiftStep(currentStep, -1);
    if (previousStep) {
      actions.gotoStep(previousStep);
    }
  },
  async shiftStepNext() {
    const { currentStep } = readers;
    if (currentStep === 'step1') {
      actions.gotoStep('step2');
    } else if (currentStep === 'step2') {
      actions.gotoStep('step3');
    } else if (currentStep === 'step3') {
      await projectQuickSetupStore.actions.createProfile();
      actions.gotoStep('step4');
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
  const { currentStep, canGoToStep } = readers;
  const { gotoStep } = actions;
  const instructionText = stepInstructionMap[currentStep];
  const style = css`
    height: 34px;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px 0 5px;
    background: ${colors.wizardHorizontalBar};

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
      {[1, 2, 3, 4].map((i) => {
        const step = `step${i}` as IProjectQuickSetupStep;
        const isCurrentStep = step === currentStep;
        return (
          <SetupNavigationStepButton
            key={i}
            text={`step${i}`}
            active={isCurrentStep}
            handler={() => gotoStep(step)}
            disabled={!isCurrentStep && !canGoToStep(step)}
          />
        );
      })}
      <Link to="/home">x</Link>
    </div>
  );
};

const WizardFooterBar: FC = () => {
  const { currentStep, canGoNext } = readers;
  const isFirstStep = currentStep === 'step1';
  const isFinalStep = currentStep === 'step4';

  const { cancelSteps, shiftStepPrevious, shiftStepNext, completeSteps } =
    actions;

  const style = css`
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    background: ${colors.wizardHorizontalBar};
  `;
  return (
    <div css={style}>
      <SetupNavigationStepShiftButton
        onClick={cancelSteps}
        text="cancel"
        qxIf={isFirstStep}
        small={true}
      />
      <SetupNavigationStepShiftButton
        onClick={shiftStepPrevious}
        text="back"
        qxIf={!isFirstStep}
        small={true}
      />

      <SetupNavigationStepShiftButton
        onClick={shiftStepNext}
        text="next"
        disabled={!canGoNext}
        qxIf={!isFinalStep}
        small={true}
      />
      <SetupNavigationStepShiftButton
        onClick={completeSteps}
        text="complete"
        disabled={!canGoNext}
        qxIf={isFinalStep}
        small={true}
      />
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
