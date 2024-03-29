import { css, FC, jsx, useLocal } from 'alumina';
import {
  encodeProjectResourceItemKey,
  getNextFirmwareVariationId,
  ICustomFirmwareEntry,
} from '~/shared';
import { colors } from '~/ui/base';
import { RouteHeaderBar } from '~/ui/elements/frames';
import {
  CustomFirmwareEditor,
  CustomFirmwareEditor_OutputPropsSupplier,
} from '~/ui/featureEditors';
import { projectResourceStore } from '~/ui/features/projectResourcesPart/store';
import { inputSavingFirmwareName } from '~/ui/pages/projectStandardFirmwareEditPage/projectStandardFirmwareEditPage.model';
import { projectPackagesWriter, uiActions, uiReaders } from '~/ui/store';

const helpers = {
  getExistingVariationIds(): string[] {
    const projectInfo = uiReaders.editTargetProject;
    return projectInfo?.firmwares.map((it) => it.variationId) || [];
  },
  async saveFirmwareEntry(firmwareName: string, customFirmwareId: string) {
    const variationId = getNextFirmwareVariationId(
      helpers.getExistingVariationIds(),
    );
    const newFirmwareEntry: ICustomFirmwareEntry = {
      type: 'custom',
      variationId,
      firmwareName,
      customFirmwareId,
    };
    await projectPackagesWriter.saveLocalProjectResourceItem(
      'firmware',
      newFirmwareEntry,
    );
    projectResourceStore.actions.setSelectedItemKey(
      encodeProjectResourceItemKey('firmware', firmwareName),
    );
  },
};

export const ProjectCustomFirmwareCreatePage: FC = () => {
  const sourceEditValues = useLocal({ customFirmwareId: '' });

  const { canSave } = CustomFirmwareEditor_OutputPropsSupplier;

  const saveHandler = async () => {
    const firmwareName = await inputSavingFirmwareName();
    if (firmwareName) {
      const { customFirmwareId } =
        CustomFirmwareEditor_OutputPropsSupplier.emitSavingEditValues();
      await helpers.saveFirmwareEntry(firmwareName, customFirmwareId);
      uiActions.closeSubPage();
    }
  };

  return (
    <div class={style}>
      <RouteHeaderBar
        title="edit custom firmware: (new)"
        backPagePath="/projectResource"
        canSave={canSave}
        saveHandler={saveHandler}
        editMode="Create"
      />
      <div class="content">
        <CustomFirmwareEditor sourceEditValues={sourceEditValues} />
      </div>
    </div>
  );
};

const style = css`
  background: ${colors.clBackground};
  color: ${colors.clMainText};
  height: 100%;
  > .content {
    padding: 15px;
  }
`;
