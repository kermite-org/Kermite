import { css, jsx } from 'qx';
import {
  GeneralSelector,
  ISelectorOption,
  texts,
  useProjectResourceInfos,
} from '~/ui/common';
import { editorModel } from '~/ui/editor-page/models/EditorModel';

const cssAttrsRow = css`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 10px;
  }
`;

export const KeyboardProjectSelectionPart = () => {
  const projectInfos = useProjectResourceInfos('projectsSortedByKeyboardName');
  const options: ISelectorOption[] = projectInfos
    .filter((it) => it.origin === 'online')
    .map((it) => ({ label: it.keyboardName, value: it.projectId }));

  if (options.length > 0) {
    options.push({ label: 'unspecified', value: 'none' });
  }

  const value = editorModel.profileData.projectId;
  const setValue = editorModel.changeProjectId;

  return (
    <div css={cssAttrsRow}>
      <div data-hint={texts.hint_assigner_profileConfigModal_assignModel}>
        target project
      </div>
      <div>
        <GeneralSelector options={options} value={value} setValue={setValue} />
      </div>
    </div>
  );
};
