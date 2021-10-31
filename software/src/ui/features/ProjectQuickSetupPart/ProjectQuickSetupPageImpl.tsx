import { css, FC, jsx } from 'qx';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';
import { WizardFooterBar } from '~/ui/features/ProjectQuickSetupPart/wizard/WizardFooterBar';
import { WizardMainContent } from '~/ui/features/ProjectQuickSetupPart/wizard/WizardMainContent';
import { WizardTopBar } from '~/ui/features/ProjectQuickSetupPart/wizard/WizardTopBar';

export const ProjectQuickSetupPageImpl: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();
  return (
    <div className={style}>
      <WizardTopBar />
      <WizardMainContent />
      <WizardFooterBar />
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
