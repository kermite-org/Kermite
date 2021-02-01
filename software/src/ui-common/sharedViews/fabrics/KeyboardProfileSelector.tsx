import { h } from 'qx';
import { ISelectorSource } from '~/ui-common';
import { GeneralSelector } from '~/ui-common/sharedViews/controls/GeneralSelector';

export interface IProfileSelectorProps {
  selectorSource: ISelectorSource;
}

export const KeyboardProfileSelector = ({
  selectorSource,
}: IProfileSelectorProps) => {
  return <GeneralSelector {...selectorSource} width={170} />;
};
