import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import { SetupNavigationStepShiftButton } from '~/ui/components';
import { IProjectQuickSetupStep } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { projectQuickSetupWizardStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupWizardStore';

type Props = {
  currentStep: IProjectQuickSetupStep;
  canGoNext: boolean;
};

export const WizardFooterBar: FC<Props> = ({ currentStep, canGoNext }) => {
  const isFirstStep = currentStep === 'step1';
  const isFinalStep = currentStep === 'step4';

  const { cancelSteps, shiftStepPrevious, shiftStepNext, completeSteps } =
    projectQuickSetupWizardStore.actions;

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

const style = css`
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: ${colors.wizardHorizontalBar};
`;
