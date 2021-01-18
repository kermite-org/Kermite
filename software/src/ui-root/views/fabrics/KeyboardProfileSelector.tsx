import { h } from 'qx';
import { ISelectorSource } from '~/ui-root/viewModels/viewModelInterfaces';
import { GeneralSelector } from '~/ui-root/views/controls/GeneralSelector';

export interface IProfileSelectorProps {
  selectorSource: ISelectorSource;
}

export const KeyboardProfileSelector = ({
  selectorSource,
}: IProfileSelectorProps) => {
  return <GeneralSelector {...selectorSource} width={170} />;
};
