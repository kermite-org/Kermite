import { css, FC, jsx } from 'qx';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';
import { projectQuickSetupWizardStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupWizardStore';
import { WizardFooterBar } from '~/ui/features/ProjectQuickSetupPart/wizard/WizardFooterBar';
import { WizardMainContent } from '~/ui/features/ProjectQuickSetupPart/wizard/WizardMainContent';
import { WizardTopBar } from '~/ui/features/ProjectQuickSetupPart/wizard/WizardTopBar';

export const ProjectQuickSetupPageImpl: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();

  const { currentStep, canGoToStep, canGoNext } =
    projectQuickSetupWizardStore.readers;
  const { shiftStepTo } = projectQuickSetupWizardStore.actions;
  return (
    <div className={style}>
      <WizardTopBar
        currentStep={currentStep}
        canGoToStep={canGoToStep}
        shiftStepTo={shiftStepTo}
      />
      <WizardMainContent currentStep={currentStep} />
      <WizardFooterBar currentStep={currentStep} canGoNext={canGoNext} />
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
