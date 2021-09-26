import { css, FC, jsx, QxNode } from 'qx';
import {
  Icon,
  SetupNavigationStepShiftButton,
  NavigationStepList,
} from '~/ui/components';
import { useSetupNavigationFrameModel } from './SetupNavigationFrame.model';

type Props = {
  className?: string;
  children: QxNode;
};

export const SetupNavigationFrame: FC<Props> = ({ className, children }) => {
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
    <div css={style} className={className}>
      <div className="top-bar">
        <NavigationStepList
          className="step-list"
          steps={allSteps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        <div className="instruction-part">
          <p>ステップを順番に進めてキーボードのセットアップを行いましょう</p>
          <p>{currentStepInstruction}</p>
        </div>
        <div className="close-button" onClick={closePanel}>
          <Icon spec="fa fa-times" />
        </div>
      </div>
      {children}
      <div className="bottom-bar">
        <SetupNavigationStepShiftButton
          qxIf={currentStep === 0}
          text="キャンセル"
          onClick={closePanel}
        />
        <SetupNavigationStepShiftButton
          onClick={shiftStepBack}
          qxIf={canShiftStepBack}
          text="戻る"
        />
        <SetupNavigationStepShiftButton
          onClick={shiftStepForward}
          qxIf={canShiftStepForward}
          text="次へ"
        />
        <SetupNavigationStepShiftButton
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
