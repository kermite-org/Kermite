import { css, FC, jsx, AluminaNode } from 'alumina';
import { colors } from '~/ui/base';
import {
  Icon,
  SetupNavigationStepShiftButton,
  NavigationStepList,
} from '~/ui/components';
import { useSetupNavigationFrameModel } from './setupNavigationFrame.model';

type Props = {
  children: AluminaNode;
};

export const SetupNavigationFrame: FC<Props> = ({ children }) => {
  const {
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
  } = useSetupNavigationFrameModel();
  return (
    <div class={style}>
      <div class="top-bar">
        <NavigationStepList
          class="step-list"
          steps={allSteps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        <div class="instruction-part">
          <p>ステップを順番に進めてキーボードのセットアップを行いましょう</p>
          <p>{currentStepInstruction}</p>
        </div>
        <div class="close-button" onClick={closePanel}>
          <Icon spec="fa fa-times" />
        </div>
      </div>
      <div class="content-row">{children}</div>
      <div class="bottom-bar">
        <SetupNavigationStepShiftButton
          if={currentStep === 0}
          text="キャンセル"
          onClick={closePanel}
        />
        <SetupNavigationStepShiftButton
          onClick={shiftStepBack}
          if={canShiftStepBack}
          text="戻る"
        />
        <SetupNavigationStepShiftButton
          onClick={shiftStepForward}
          if={canShiftStepForward}
          text="次へ"
        />
        <SetupNavigationStepShiftButton
          onClick={completeSteps}
          if={canCompleteSteps}
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
    flex-shrink: 0;
    height: 110px;
    padding: 10px 15px;
    position: relative;
    background: ${colors.wizardHorizontalBar};

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

  > .content-row {
    height: 0;
    flex-shrink: 1;
    flex-grow: 1;
    overflow: hidden;
    > div {
      height: 100%;
    }
  }

  > .bottom-bar {
    flex-shrink: 0;
    height: 50px;
    background: ${colors.wizardHorizontalBar};
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 80px;
  }
`;
