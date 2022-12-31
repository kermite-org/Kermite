import { FC, jsx } from 'alumina';
import { ISelectorSource } from '~/fe-shared';
import { GeneralSelector } from '../atoms';

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
