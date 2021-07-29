import { FC, jsx } from 'qx';
import { ISelectorSource } from '~/ui/base';
import { GeneralSelector } from '~/ui/components/atoms/GeneralSelector';

interface Props {
  selectorSource: ISelectorSource;
  hint?: string;
}

export const KeyboardProfileSelector: FC<Props> = ({
  selectorSource,
  hint,
}) => (
  <GeneralSelector
    {...selectorSource}
    width={170}
    hint={hint}
    forceControlled
  />
);
