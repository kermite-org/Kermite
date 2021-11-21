import { isNumberInRange } from '~/shared';
import { uiConfiguration } from '~/ui/base';
import { IProjectQuickSetupStep } from '~/ui/commonModels';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupStore';
import { uiActions, uiReaders } from '~/ui/store';

const helpers = {
  shiftStep(
    step: IProjectQuickSetupStep,
    dir: number,
  ): IProjectQuickSetupStep | undefined {
    const nextStepNumber = parseInt(step.replace('step', ''), 10) + dir;
    if (isNumberInRange(nextStepNumber, 1, 3)) {
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
  canGoToStep(targetStep: IProjectQuickSetupStep): boolean {
    if (targetStep === 'step2') {
      return projectQuickSetupStore.readers.isFirmwareConfigurationStepValid;
    } else if (targetStep === 'step3') {
      if (uiConfiguration.checkDeviceConnectionOnWizard) {
        return projectQuickSetupStore.readers.isTargetDeviceConnected;
      } else {
        return true;
      }
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
  shiftStepTo(step: IProjectQuickSetupStep) {
    uiActions.navigateTo(`/projectQuickSetup/${step}`);
  },
  async shiftStep(dir: number) {
    const { currentStep } = readers;
    if (currentStep === 'step1' && dir === -1) {
      uiActions.navigateTo('/home');
    } else if (currentStep === 'step3' && dir === 1) {
      await projectQuickSetupStore.actions.createProfile();
      uiActions.navigateTo('/assigner');
    } else {
      const nextStep = helpers.shiftStep(readers.currentStep, dir);
      if (nextStep) {
        actions.shiftStepTo(nextStep);
      }
    }
  },
};

export const projectQuickSetupWizardStore = {
  readers,
  actions,
};
