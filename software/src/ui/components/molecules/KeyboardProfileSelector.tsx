import { FC, jsx } from 'alumina';
import { ISelectorSource } from '~/ui/base';
import { GeneralSelector } from '~/ui/components/atoms/GeneralSelector';

interface Props {
  selectorSource: ISelectorSource;
  hint?: string;
  disabled?: boolean;
  width?: number;
}

export const KeyboardProfileSelector: FC<Props> = ({
  selectorSource,
  hint,
  disabled,
  width = 240,
}) => (
  <GeneralSelector
    {...selectorSource}
    width={width}
    hint={hint}
    forceControlled
    disabled={disabled}
  />
);
