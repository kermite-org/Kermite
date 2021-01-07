import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';
import { GeneralSelector } from '~ui/views/controls/GeneralSelector';
import { h } from '~qx';

export interface IProfileSelectorProps {
  selectorSource: ISelectorSource;
}

export const KeyboardProfileSelector = ({
  selectorSource,
}: IProfileSelectorProps) => {
  return <GeneralSelector {...selectorSource} width={170} />;
};
