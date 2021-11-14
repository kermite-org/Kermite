import { css, FC, jsx, QxNode } from 'alumina';
import { colors } from '~/ui/base';
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
      <div className="content-row">{children}</div>
      <div className="bottom-bar">
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
