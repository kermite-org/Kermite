import { css, jsx } from 'qx';
import { uniqueArrayItemsByField } from '~/shared';
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
  const options: ISelectorOption[] = uniqueArrayItemsByField(
    projectInfos,
    'projectId',
  ).map((it) => ({ label: it.keyboardName, value: it.projectId }));

  if (options.length > 0) {
    options.push({ label: 'unspecified', value: '__PROJECT_ID_UNSPECIFIED' });
  }

  const value = editorModel.profileData.projectId || '__PROJECT_ID_UNSPECIFIED';
  const setValue = (value: string) => {
    editorModel.changeProjectId(
      value === '__PROJECT_ID_UNSPECIFIED' ? '' : value,
    );
  };

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
