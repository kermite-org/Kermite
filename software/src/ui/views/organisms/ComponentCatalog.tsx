import { css } from 'goober';
import { h } from '~lib/qx';
import { GeneralButton } from '../controls/GeneralButton';
import {
  GeneralSelector2,
  IGeneralSelector2Props
} from '../controls/GeneralSelector2';
import {
  IKeyboardBreedSelectorProps,
  KeyboardBreedSelector
} from '../fabric/KeyboardBreedSelector';
import { ProfileSelector } from '../fabric/ProfileSelector';

const testOptions: IGeneralSelector2Props['options'] = [
  { id: '', text: 'no-user' },
  { id: 'user001', text: 'yamada' },
  { id: 'user002', text: 'tanaka' },
  { id: 'user003', text: 'suzuki' }
];

const projectOptions: IKeyboardBreedSelectorProps['projectOptions'] = [
  { projectId: 'none', projectName: 'no selection', projectPath: '' },
  {
    projectId: 'proj001',
    projectName: 'MyKbd',
    projectPath: 'mykbd'
  },
  {
    projectId: 'proj002',
    projectPath: 'TestKeyboard',
    projectName: 'proto/testkbd'
  }
];

const profileNames: string[] = ['blank', 'qwerty', 'dvorak', 'profile1'];

const cssBase = css`
  /* margin: 20px; */

  > * + * {
    margin-top: 10px;
  }
  > .buttonsRow {
    display: flex;
    > * + * {
      margin-left: 10px;
    }
  }
`;

const buttonExtraCss = css`
  background: orange;
`;

export const ComponentCatalog = () => {
  const buttonHandler = () => {
    console.log('clicked');
  };

  let curUserId = 'user001';

  const setCurrentUserId = (userId: string) => {
    console.log(`user selected ${userId}`);
    curUserId = userId;
  };

  let selectedProjectId = 'none';

  const setSelectedProjectId = (projectId: string) => {
    selectedProjectId = projectId;
    console.log({ projectId });
  };

  let selectedProfileName = 'blank';

  const setSelectedProfileName = (profileName: string) => {
    selectedProfileName = profileName;
    console.log({ profileName });
  };

  return () => (
    <div css={cssBase}>
      <div class="buttonsRow">
        <GeneralButton
          icon="fa fa-cog"
          handler={buttonHandler}
          form="unitSquare"
        />
        <GeneralButton
          text="foo"
          icon="fa fa-cog"
          className={buttonExtraCss}
          form="unit"
        />
        <GeneralButton icon="fa fa-cog" disabled form="unitSquare" />
        <GeneralButton text="OK" form="unit" />
        <GeneralButton text="Edit this" form="unit" />
        <GeneralButton text="Edit this" form="large" />
      </div>

      <GeneralSelector2
        options={testOptions}
        choiceId={curUserId}
        setChoiceId={setCurrentUserId}
      />

      <KeyboardBreedSelector
        projectOptions={projectOptions}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        connectedDeviceProjectId="proj002"
      />

      <ProfileSelector
        optionProfileNames={profileNames}
        selectedProfileName={selectedProfileName}
        setSelectedProfileName={setSelectedProfileName}
      />
    </div>
  );
};
