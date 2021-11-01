import { isNumberInRange } from '~/shared';
import { IProjectQuickSetupStep } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';
import { uiActions, uiReaders } from '~/ui/store';

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
    if (currentStep === 'step1') {
      const { isConfigValid, keyboardName } = projectQuickSetupStore.state;
      const { keyboardNameValidationError } = projectQuickSetupStore.readers;
      return isConfigValid && !!keyboardName && !keyboardNameValidationError;
    } else {
      return true;
    }
  },
  get canGoNext(): boolean {
    const { currentStep } = readers;
    const nextStep = helpers.shiftStep(currentStep, 1);
    return (nextStep && readers.canGoToStep(nextStep)) || false;
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

export const projectQuickSetupWizardStore = {
  readers,
  actions,
};
