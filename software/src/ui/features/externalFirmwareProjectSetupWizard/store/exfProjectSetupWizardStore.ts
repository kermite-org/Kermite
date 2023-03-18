import { isNumberInRange } from '~/shared';
import { IExtProjectSetupStep } from '~/ui/commonModels';
import { exfProjectSetupStore } from '~/ui/features/externalFirmwareProjectSetupWizard/store/exfProjectSetupStore';
import { uiActions, uiReaders } from '~/ui/store';

type IStep = IExtProjectSetupStep;

const helpers = {
  shiftStep(step: IStep, dir: number): IStep | undefined {
    const nextStepNumber = parseInt(step.replace('step', ''), 10) + dir;
    if (isNumberInRange(nextStepNumber, 1, 2)) {
      return `step${nextStepNumber}` as IStep;
    }
    return undefined;
  },
};

const readers = {
  get currentStep(): IStep {
    return uiReaders.pagePath.split('/')[2] as IStep;
  },
  get currentStepNumber(): number {
    return parseInt(readers.currentStep);
  },
  canGoToStep(targetStep: IStep): boolean {
    if (targetStep === 'step2') {
      return exfProjectSetupStore.readers.isFirmwareConfigurationStepValid;
    }
    return true;
  },
  get canGoNext(): boolean {
    return exfProjectSetupStore.readers.isFirmwareConfigurationStepValid;
  },
};

const actions = {
  shiftStepTo(step: IStep) {
    uiActions.navigateTo(`/externalFirmwareProjectSetup/${step}`);
  },
  async shiftStep(dir: number) {
    const { currentStep } = readers;
    if (currentStep === 'step1' && dir === -1) {
      uiActions.navigateTo('/home');
    } else if (currentStep === 'step2' && dir === 1) {
      await exfProjectSetupStore.actions.createProfile();
      uiActions.navigateTo('/assigner');
    } else {
      const nextStep = helpers.shiftStep(readers.currentStep, dir);
      if (nextStep) {
        actions.shiftStepTo(nextStep);
      }
    }
  },
};

export const exfProjectSetupWizardStore = {
  readers,
  actions,
};
