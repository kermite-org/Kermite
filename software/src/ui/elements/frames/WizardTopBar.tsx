import { css, FC, jsx } from 'alumina';
import { colors, Link, texts } from '~/ui/base';
import { Icon, SetupNavigationStepButton } from '~/ui/components';

type Props = {
  steps: string[];
  currentStep: string;
  canGoToStep(step: string): boolean;
  shiftStepTo(step: string): void;
  stepInstructionTextMap: Record<string, string>;
};

const getStepText = (step: string): string =>
  step.replace('step', texts.wizardCommon.step);

export const WizardTopBar: FC<Props> = ({
  steps,
  currentStep,
  canGoToStep,
  shiftStepTo,
  stepInstructionTextMap,
}) => (
  <div class={style}>
    <div>
      {getStepText(currentStep)}: {stepInstructionTextMap[currentStep]}
    </div>
    {steps.map((step) => {
      const isCurrentStep = step === currentStep;
      return (
        <SetupNavigationStepButton
          key={step}
          text={getStepText(step)}
          active={isCurrentStep}
          handler={() => shiftStepTo(step)}
          disabled={!isCurrentStep && !canGoToStep(step)}
        />
      );
    })}
    <Link to="/home">
      <Icon spec="fa fa-times" size={13} />
    </Link>
  </div>
);

const style = css`
  height: 34px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px 0 5px;
  background: ${colors.wizardHorizontalBar};

  > div {
    cursor: pointer;
  }

  > :first-child {
    margin-right: auto;
  }

  > :last-child {
    margin-left: 10px;
  }
`;
