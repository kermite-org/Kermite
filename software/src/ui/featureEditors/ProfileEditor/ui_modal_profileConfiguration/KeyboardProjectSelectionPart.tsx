import { css, FC, jsx } from 'alumina';
import { uniqueArrayItemsByField } from '~/shared';
import { ISelectorOption, texts } from '~/ui/base';
import { GeneralSelector } from '~/ui/components';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import { uiReaders } from '~/ui/store';

const fallbackProjectId = '000000';

function makeTargetProjectSelectOptions(): ISelectorOption[] {
  const projectInfos = uiReaders.activeProjectPackageInfos;
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
