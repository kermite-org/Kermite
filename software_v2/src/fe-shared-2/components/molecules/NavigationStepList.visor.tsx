import { jsx } from 'alumina';
import { NavigationStepList } from './NavigationStepList';
import { NavigationStepListStepCard } from './NavigationStepList.StepCard';

const steps = [0, 1, 2, 3];
let step = 0;

export default {
  card: <NavigationStepListStepCard step={0} isActive={false} />,
  cardActive: <NavigationStepListStepCard step={1} isActive={true} />,
  list: () => (
    <NavigationStepList
      steps={steps}
      currentStep={step}
      setCurrentStep={(s) => (step = s)}
    />
  ),
};
