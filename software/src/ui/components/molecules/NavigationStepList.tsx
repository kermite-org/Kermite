import { css, FC, jsx } from 'alumina';
import { NavigationStepListStepCard } from '~/ui/components/molecules/NavigationStepList.StepCard';

type Props = {
  steps: number[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

export const NavigationStepList: FC<Props> = ({
  steps,
  currentStep,
  setCurrentStep,
}) => (
  <div class={style}>
    {steps.map((step) => (
      <NavigationStepListStepCard
        key={step}
        step={step}
        isActive={step === currentStep}
        clickHandler={() => setCurrentStep(step)}
      />
    ))}
  </div>
);

const style = css`
  display: flex;
`;
