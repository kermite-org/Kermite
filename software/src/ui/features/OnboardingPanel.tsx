import { css, FC, jsx, QxNode } from 'qx';
import { getObjectKeyByValue, isNumberInRange } from '~/shared';
import { router } from '~/ui/base';
import { onboardingPanelDisplayStateModel, PagePaths } from '~/ui/commonModels';
import { Icon } from '~/ui/components';
import { OnboardingStepShiftButton } from '~/ui/components/atoms/OnboardingButton';
import { NavigationStepList } from '~/ui/components/molecules/NavigationStepList';

type Props = {
  className?: string;
  children: QxNode;
};

const steps = [0, 1, 2, 3, 4];

const stepToPagePathMap: { [step: number]: PagePaths | undefined } = {
  0: '/home',
  1: '/projectSelection',
  2: '/firmwareUpdate',
  3: '/presetBrowser',
  4: '/editor',
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

export const OnboardingFrame: FC<Props> = ({ className, children }) => {
  const pagePath = router.getPagePath();
  const currentStep = getStepByPagePath(pagePath);

  const setStep = (newStep: number) => {
    const newPagePath = stepToPagePathMap[newStep];
    if (newPagePath) {
      router.navigateTo(newPagePath);
    }
  };

  const closePanel = onboardingPanelDisplayStateModel.close;

  const canShiftStepBack = isNumberInRange(currentStep, 1, 4);
  const canShiftStepForward = isNumberInRange(currentStep, 0, 3);

  const shiftStepBack = () => setStep(currentStep - 1);
  const shiftStepForward = () => setStep(currentStep + 1);

  const canCompleteSteps = currentStep === 4;
  const completeSteps = closePanel;

  return (
    <div css={style} className={className}>
      <div className="top-bar">
        <NavigationStepList
          className="step-list"
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setStep}
        />
        <div className="instruction-part">
          <p>ステップを順番に進めてキーボードのセットアップを行いましょう</p>
          <p>{stepInstructionMap[currentStep]}</p>
        </div>
        <div className="close-button" onClick={closePanel}>
          <Icon spec="fa fa-times" />
        </div>
      </div>
      {children}
      <div className="bottom-bar">
        <OnboardingStepShiftButton
          qxIf={currentStep === 0}
          text="キャンセル"
          onClick={closePanel}
        />
        <OnboardingStepShiftButton
          onClick={shiftStepBack}
          qxIf={canShiftStepBack}
          text="戻る"
        />
        <OnboardingStepShiftButton
          onClick={shiftStepForward}
          qxIf={canShiftStepForward}
          text="次へ"
        />
        <OnboardingStepShiftButton
          onClick={completeSteps}
          qxIf={canCompleteSteps}
          text="完了"
        />
      </div>
    </div>
  );
};

const style = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  > .top-bar {
    height: 110px;
    padding: 10px 15px;
    position: relative;

    > .step-list {
    }

    > .instruction-part {
      margin-top: 10px;
      line-height: 1.5em;
    }

    > .close-button {
      position: absolute;
      right: 0;
      top: 0;
      margin: 12px;
      cursor: pointer;
    }
  }

  > .bottom-bar {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 80px;
  }
`;
