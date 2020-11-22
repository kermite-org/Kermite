import { h } from '~lib/qx';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';
import { GeneralSelector } from '~ui/views/controls/GeneralSelector';

export interface IProfileSelectorProps {
  selectorSource: ISelectorSource;
}

export const KeyboardProfileSelector = ({
  selectorSource
}: IProfileSelectorProps) => {
  return <GeneralSelector {...selectorSource} width={170} />;
};