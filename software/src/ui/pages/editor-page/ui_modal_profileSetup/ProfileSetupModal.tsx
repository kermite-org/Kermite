import { jsx, useInlineEffect, useLocal, useMemo } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { ISelectorOption } from '~/ui/base';
import { projectPackagesReader } from '~/ui/commonModels';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogContentRow,
  GeneralSelector,
  DialogButtonsRow,
  DialogButton,
  createModal,
  cssCommonPropertiesTable,
  cssCommonTextInput,
} from '~/ui/components';
import { reflectFieldValue, fieldSetter, useMemoEx } from '~/ui/helpers';

interface ICreateProfileDialogEditValues {
  profileName: string;
  projectKey: string;
  layoutKey: string;
}

const ProfileSetupModalContent = (props: {
  editValues: ICreateProfileDialogEditValues;
  projectOptions: ISelectorOption[];
  layoutOptions: ISelectorOption[];
  canSubmit: boolean;
  submit(): void;
  close(): void;
}) => {
  const {
    editValues,
    submit,
    close,
    projectOptions,
    layoutOptions,
    canSubmit,
  } = props;
  return (
    <ClosableOverlay close={close}>
      <CommonDialogFrame caption="Create Profile" close={close}>
        <DialogContentRow>
          <table css={cssCommonPropertiesTable}>
            <tbody>
              <tr>
                <td>Profile Name</td>
                <td>
                  <input
                    type="text"
                    css={cssCommonTextInput}
                    value={editValues.profileName}
                    onInput={reflectFieldValue(editValues, 'profileName')}
                    spellcheck={'false' as any}
                  />
                </td>
              </tr>
              <tr>
                <td>Target Keyboard</td>
                <td>
                  <GeneralSelector
                    options={projectOptions}
                    value={editValues.projectKey}
                    setValue={fieldSetter(editValues, 'projectKey')}
                    width={150}
                  />
                </td>
              </tr>
              <tr>
                <td>Layout</td>
                <td>
                  <GeneralSelector
                    options={layoutOptions}
                    value={editValues.layoutKey}
                    setValue={fieldSetter(editValues, 'layoutKey')}
                    width={150}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </DialogContentRow>
        <DialogButtonsRow>
          <DialogButton onClick={submit} disabled={!canSubmit}>
            OK
          </DialogButton>
        </DialogButtonsRow>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};

interface IProfileSetupModalViewModel {
  projectOptions: ISelectorOption[];
  layoutOptions: ISelectorOption[];
  editValues: ICreateProfileDialogEditValues;
  canSubmit: boolean;
}

function makeProjectOptions(infos: IProjectPackageInfo[]): ISelectorOption[] {
  return infos.map((info) => ({
    value: info.sig,
    label: `${info.origin === 'local' ? '(local) ' : ''}${info.keyboardName}`,
  }));
}

function makeLayoutOptions(
  resouceInfos: IProjectPackageInfo[],
  projectSig: string,
): ISelectorOption[] {
  const info = resouceInfos.find((info) => info.sig === projectSig);
  return (
    info?.layouts.map((it) => ({
      value: it.layoutName,
      label: it.layoutName,
    })) || []
  );
}

function useProfileSetupModalViewModel(): IProfileSetupModalViewModel {
  const editValues = useLocal({
    profileName: '',
    projectKey: '',
    layoutKey: '',
  });

  const resourceInfos = useMemo(
    projectPackagesReader.getProjectInfosGlobalProjectSelectionAffected,
    [],
  );
  const projectOptions = useMemoEx(makeProjectOptions, [resourceInfos]);

  useInlineEffect(() => {
    editValues.projectKey = projectOptions[0]?.value || '';
  }, [projectOptions]);

  const layoutOptions = useMemoEx(makeLayoutOptions, [
    resourceInfos,
    editValues.projectKey,
  ]);

  useInlineEffect(() => {
    editValues.layoutKey = layoutOptions[0]?.value || '';
  }, [layoutOptions]);

  const canSubmit =
    (!!editValues.profileName &&
      !!editValues.projectKey &&
      !!editValues.layoutKey) ||
    false;

  return {
    projectOptions,
    layoutOptions,
    editValues,
    canSubmit,
  };
}

export const callProfileSetupModal = createModal(() => {
  return (props: {
    close: (result: ICreateProfileDialogEditValues | undefined) => void;
  }) => {
    const vm = useProfileSetupModalViewModel();
    const submit = () => props.close(vm.editValues);
    const close = () => props.close(undefined);
    return (
      <ProfileSetupModalContent
        editValues={vm.editValues}
        projectOptions={vm.projectOptions}
        layoutOptions={vm.layoutOptions}
        canSubmit={vm.canSubmit}
        submit={submit}
        close={close}
      />
    );
  };
});
