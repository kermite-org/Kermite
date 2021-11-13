import { FC, jsx } from 'alumina';
import { ISelectorSource } from '~/ui/base';
import { GeneralSelector } from '~/ui/components/atoms/GeneralSelector';

interface Props {
  selectorSource: ISelectorSource;
  hint?: string;
  disabled?: boolean;
}

export const KeyboardProfileSelector: FC<Props> = ({
  selectorSource,
  hint,
  disabled,
}) => (
  <GeneralSelector
    {...selectorSource}
    width={170}
    hint={hint}
    forceControlled
    disabled={disabled}
  />
);
