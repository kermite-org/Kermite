import { FC, css, jsx } from 'alumina';
import { ISelectorOption, texts, uniqueArrayItemsByField } from '~/app-shared';
import { GeneralSelector } from '~/fe-shared';
// import { uiReaders } from '~/ui/store';
import { profileEditorConfig } from '../adapters';
import { assignerModel } from '../models';

const fallbackProjectId = '000000';

function makeTargetProjectSelectOptions(): ISelectorOption[] {
  const projectInfos = profileEditorConfig.activeProjectPackageInfos;
  const options: ISelectorOption[] = uniqueArrayItemsByField(
    projectInfos,
    'projectId',
  ).map((it) => ({ label: it.keyboardName, value: it.projectId }));

  const originalProjectId = assignerModel.loadedProfileData.projectId;
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
  const value = assignerModel.profileData.projectId || '';
  const setValue = assignerModel.changeProjectId;

  return (
    <div class={style}>
      <div data-hint={texts.assignerProfileConfigModalHint.assignModel}>
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
