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

const cssBase = css`
  margin: 20px;

  > * + * {
    margin-top: 10px;
  }
  > .buttonsRow {
    display: flex;
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

  return () => (
    <div css={cssBase}>
      <div class="buttonsRow">
        <GeneralButton icon="fa fa-cog" handler={buttonHandler} />
        <GeneralButton text="foo" icon="fa fa-cog" className={buttonExtraCss} />
        <GeneralButton icon="fa fa-cog" disabled />
        <GeneralButton text="OK" />
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
        // connectedDeviceProjectId={undefined}
        connectedDeviceProjectId="proj002"
      />
    </div>
  );
};
