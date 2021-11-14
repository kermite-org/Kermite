import { css, FC, jsx } from 'alumina';
import { NavigationStepListStepCard } from '~/ui/components/molecules/NavigationStepList.StepCard';

type Props = {
  className?: string;
  steps: number[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

export const NavigationStepList: FC<Props> = ({
  className,
  steps,
  currentStep,
  setCurrentStep,
}) => (
  <div css={style} className={className}>
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
