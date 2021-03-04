import { jsx } from 'qx';
import { ISelectorSource } from '~/ui-common';
import { GeneralSelector } from '~/ui-common/components/controls/GeneralSelector';

export interface IProfileSelectorProps {
  selectorSource: ISelectorSource;
  hint?: string;
}

export const KeyboardProfileSelector = ({
  selectorSource,
  hint,
}: IProfileSelectorProps) => {
  return <GeneralSelector {...selectorSource} width={170} hint={hint} />;
};
