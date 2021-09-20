import { css, FC, jsx } from 'qx';
import { uniqueArrayItemsByField } from '~/shared';
import { ISelectorOption, texts } from '~/ui/base';
import { GeneralSelector } from '~/ui/components';
import { editorModel } from '~/ui/editors/ProfileEditor/models/EditorModel';
import { uiReaders } from '~/ui/store';

const fallbackProjectId = '000000';

function makeTargetProjectSelectOptions(): ISelectorOption[] {
  const projectInfos = uiReaders.allProjectPackageInfos;
  const options: ISelectorOption[] = uniqueArrayItemsByField(
    projectInfos,
    'projectId',
  ).map((it) => ({ label: it.keyboardName, value: it.projectId }));

  const originalProjectId = editorModel.loadedProfileData.projectId;
  if (
    originalProjectId !== fallbackProjectId &&
    !options.find((it) => it.value === originalProjectId)
  ) {
    options.push({
      label: `unknown(${originalProjectId})`,
      value: originalProjectId,
    });
  }
  options.push({
    label: `unknown(${fallbackProjectId})`,
    value: fallbackProjectId,
  });

  return options;
}

export const KeyboardProjectSelectionPart: FC = () => {
  const options = makeTargetProjectSelectOptions();
  const value = editorModel.profileData.projectId || '';
  const setValue = editorModel.changeProjectId;

  return (
    <div css={style}>
      <div data-hint={texts.hint_assigner_profileConfigModal_assignModel}>
        target project
      </div>
      <div>
        <GeneralSelector options={options} value={value} setValue={setValue} />
      </div>
    </div>
  );
};

const style = css`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 10px;
  }
`;
