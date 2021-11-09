import { isNumberInRange } from '~/shared';
import { IProfileSetupStep } from '~/ui/commonModels';
import { profileSetupStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupStore';
import { uiActions, uiReaders } from '~/ui/store';

const helpers = {
  shiftStep(
    step: IProfileSetupStep,
    dir: number,
  ): IProfileSetupStep | undefined {
    const nextStepNumber = parseInt(step.replace('step', ''), 10) + dir;
    if (isNumberInRange(nextStepNumber, 1, 3)) {
      return `step${nextStepNumber}` as IProfileSetupStep;
    }
    return undefined;
  },
};

const readers = {
  get currentStep(): IProfileSetupStep {
    return uiReaders.pagePath.split('/')[2] as IProfileSetupStep;
  },
  get currentStepNumber(): number {
    return parseInt(readers.currentStep);
  },
  canGoToStep(targetStep: IProfileSetupStep): boolean {
    if (targetStep === 'step2') {
      return !!profileSetupStore.state.targetProjectKey;
    } else if (targetStep === 'step3') {
      return profileSetupStore.readers.isTargetDeviceConnected;
    } else {
      return true;
    }
  },
  get canGoNext(): boolean {
    const { currentStep } = readers;
    if (currentStep === 'step3') {
      return true;
    }
    const nextStep = helpers.shiftStep(currentStep, 1);
    return (nextStep && readers.canGoToStep(nextStep)) || false;
  },
};

const actions = {
  shiftStepTo(step: IProfileSetupStep) {
    uiActions.navigateTo(`/profileSetup/${step}`);
  },
  async shiftStep(dir: number) {
    const { currentStep } = readers;
    if (currentStep === 'step1' && dir === -1) {
      uiActions.navigateTo('/home');
    } else if (currentStep === 'step3' && dir === 1) {
      await profileSetupStore.actions.createProfile();
      uiActions.navigateTo('/assigner');
    } else {
      const nextStep = helpers.shiftStep(readers.currentStep, dir);
      if (nextStep) {
        actions.shiftStepTo(nextStep);
      }
    }
  },
};

export const profileSetupWizardStore = {
  readers,
  actions,
};
