import { css } from 'goober';
import { h } from '~lib/qx';
import { GeneralButton } from '../controls/GeneralButton';
import {
  GeneralSelector2,
  IGeneralSelector2Option
} from '../controls/GeneralSelector2';

export interface IKeyboardBreedSelectorProps {
  projectOptions: {
    projectId: string;
    projectName: string;
    projectPath: string;
  }[];
  selectedProjectId: string;
  setSelectedProjectId(projectId: string): void;
  connectedDeviceProjectId: string | undefined;
}

const cssKeyboardBreedSelector = css`
  display: flex;

  > .selector {
    width: 150px;
  }

  > .linkButton {
    width: 28px;
    height: 28px;
  }
`;

function makeKeyboardBreedSelectorLocalModel(
  props: IKeyboardBreedSelectorProps
) {
  const {
    projectOptions,
    selectedProjectId,
    setSelectedProjectId,
    connectedDeviceProjectId
  } = props;
  const selectorProjectOptions: IGeneralSelector2Option[] = projectOptions.map(
    (it) => ({
      id: it.projectId,
      text: it.projectName
    })
  );

  const linkButtonActive =
    !!connectedDeviceProjectId &&
    connectedDeviceProjectId !== selectedProjectId;

  const onLinkButton = () => {
    if (connectedDeviceProjectId) {
      setSelectedProjectId(connectedDeviceProjectId);
    }
  };
  return {
    selectorProjectOptions,
    selectedProjectId,
    setSelectedProjectId,
    linkButtonActive,
    onLinkButton
  };
}

export const KeyboardBreedSelector = (props: IKeyboardBreedSelectorProps) => {
  const {
    selectorProjectOptions,
    selectedProjectId,
    setSelectedProjectId,
    linkButtonActive,
    onLinkButton
  } = makeKeyboardBreedSelectorLocalModel(props);

  return (
    <div css={cssKeyboardBreedSelector}>
      <GeneralSelector2
        options={selectorProjectOptions}
        choiceId={selectedProjectId}
        setChoiceId={setSelectedProjectId}
        className="selector"
      />
      <GeneralButton
        icon="fas fa-link"
        disabled={!linkButtonActive}
        handler={onLinkButton}
        className="linkButton"
      />
    </div>
  );
};
