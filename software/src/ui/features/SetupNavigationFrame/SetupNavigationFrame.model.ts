import { getObjectKeyByValue, isNumberInRange } from '~/shared';
import { PagePaths } from '~/ui/commonModels';
import { uiActions, uiReaders } from '~/ui/store';

interface SetupNavigationFrameModel {
  allSteps: number[];
  currentStep: number;
  setCurrentStep(step: number): void;
  currentStepInstruction: string;
  closePanel(): void;
  canShiftStepBack: boolean;
  shiftStepBack(): void;
  canShiftStepForward: boolean;
  shiftStepForward(): void;
  canCompleteSteps: boolean;
  completeSteps(): void;
}

const allSteps = [0, 1, 2, 3, 4];

const stepToPagePathMap: { [step: number]: PagePaths | undefined } = {
  0: '/home',
  1: '/projectSelection',
  2: '/firmwareUpdate',
  3: '/presetBrowser',
  4: '/assigner',
};

const stepInstructionMap: { [step: number]: string } = {
  0: 'Step0: ホーム画面です。',
  1: 'Step1: 使用するキーボードを選択します。',
  2: 'Step2: デバイスにファームウェアを書き込みます。',
  3: 'Step3: 使用するプリセットを選び、プロファイルを作成します。',
  4: 'Step4: プロファイルを保存して、デバイスにキーマッピングを書き込みます。',
};

function getStepByPagePath(pagePath: string): number {
  const _step = getObjectKeyByValue(stepToPagePathMap, pagePath);
  return _step === undefined ? -1 : parseInt(_step);
}

export function useSetupNavigationFrameModel(): SetupNavigationFrameModel {
  const { pagePath } = uiReaders;
  const currentStep = getStepByPagePath(pagePath);

  const setCurrentStep = (newStep: number) => {
    const newPagePath = stepToPagePathMap[newStep];
    if (newPagePath) {
      uiActions.navigateTo(newPagePath);
    }
  };

  const closePanel = uiActions.closeSetupNavigationPanel;

  const currentStepInstruction = stepInstructionMap[currentStep];

  const canShiftStepBack = isNumberInRange(currentStep, 1, 4);
  const canShiftStepForward = isNumberInRange(currentStep, 0, 3);

  const shiftStepBack = () => setCurrentStep(currentStep - 1);
  const shiftStepForward = () => setCurrentStep(currentStep + 1);

  const canCompleteSteps = currentStep === 4;
  const completeSteps = closePanel;

  return {
    allSteps,
    currentStep,
    setCurrentStep,
    currentStepInstruction,
    closePanel,
    canShiftStepBack,
    shiftStepBack,
    canShiftStepForward,
    shiftStepForward,
    canCompleteSteps,
    completeSteps,
  };
}
