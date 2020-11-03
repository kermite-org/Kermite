import { h } from '~lib/qx';
import { GeneralSelector2 } from '../controls/GeneralSelector2';

export interface IProfileSelectorProps {
  optionProfileNames: string[];
  selectedProfileName: string;
  setSelectedProfileName(profileName: string): void;
}

export const ProfileSelector = ({
  optionProfileNames,
  selectedProfileName,
  setSelectedProfileName
}: IProfileSelectorProps) => {
  const selectorOptions = optionProfileNames.map((it) => ({
    id: it,
    text: it
  }));

  return (
    <GeneralSelector2
      options={selectorOptions}
      choiceId={selectedProfileName}
      setChoiceId={setSelectedProfileName}
      width={170}
    />
  );
};
