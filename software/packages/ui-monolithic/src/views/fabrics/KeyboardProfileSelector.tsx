import { h } from 'qx';
import { ISelectorSource } from '~/viewModels/viewModelInterfaces';
import { GeneralSelector } from '~/views/controls/GeneralSelector';

export interface IProfileSelectorProps {
  selectorSource: ISelectorSource;
}

export const KeyboardProfileSelector = ({
  selectorSource,
}: IProfileSelectorProps) => {
  return <GeneralSelector {...selectorSource} width={170} />;
};
