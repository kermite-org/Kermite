import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import { SetupNavigationStepShiftButton } from '~/ui/components';

type Props = {
  currentStep: string;
  canGoNext: boolean;
  firstStep: string;
  finalStep: string;
  shiftStep: (dir: number) => void;
};

export const WizardFooterBar: FC<Props> = ({
  currentStep,
  canGoNext,
  firstStep,
  finalStep,
  shiftStep,
}) => {
  const backText = currentStep === firstStep ? 'cancel' : 'back';
  const nextText = currentStep === finalStep ? 'complete' : 'next';

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
