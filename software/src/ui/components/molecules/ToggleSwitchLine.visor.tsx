import { jsx } from 'alumina';
import { ToggleSwitchLine } from '~/ui/components/molecules/ToggleSwitchLine';

export const ToggleSwitchLineExamples = {
  leftText: <ToggleSwitchLine checked={false} text="special mode" />,
  rightText: (
    <ToggleSwitchLine checked={false} text="special mode" textSide="right" />
  ),
  disabled: <ToggleSwitchLine checked={false} text="special mode" disabled />,
};
