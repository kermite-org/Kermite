import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import { IProjectQuickSetupStep } from '~/ui/commonModels';
import { SetupNavigationStepShiftButton } from '~/ui/components';
import { projectQuickSetupWizardStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupWizardStore';

type Props = {
  currentStep: IProjectQuickSetupStep;
  canGoNext: boolean;
};

export const WizardFooterBar: FC<Props> = ({ currentStep, canGoNext }) => {
  const isFirstStep = currentStep === 'step1';
  const isFinalStep = currentStep === 'step3';

  const { shiftStep } = projectQuickSetupWizardStore.actions;

  const backText = isFirstStep ? 'cancel' : 'back';
  const nextText = isFinalStep ? 'complete' : 'next';

  return (
    <div css={style}>
      <SetupNavigationStepShiftButton
        onClick={() => shiftStep(-1)}
        text={backText}
        small={true}
      />
      <SetupNavigationStepShiftButton
        onClick={() => shiftStep(1)}
        text={nextText}
        disabled={!canGoNext}
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
