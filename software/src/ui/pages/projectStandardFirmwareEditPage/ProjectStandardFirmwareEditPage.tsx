import { css, FC, jsx } from 'alumina';
import { colors } from '~/ui/base';
import { IPageSpec_ProjectStandardFirmwareView } from '~/ui/commonModels';
import { RouteHeaderBar } from '~/ui/elements/frames';
import { StandardFirmwareEditor } from '~/ui/featureEditors';
import { useProjectStandardFirmwareEditPageModel } from '~/ui/pages/projectStandardFirmwareEditPage/projectStandardFirmwareEditPage.model';

type Props = {
  spec: IPageSpec_ProjectStandardFirmwareView;
};

export const ProjectStandardFirmwareEditPage: FC<Props> = ({
  spec: { projectKey, firmwareName: sourceFirmwareName, canEdit },
}) => {
  const { editFirmwareName, canSave, saveHandler, backHandler } =
    useProjectStandardFirmwareEditPageModel(projectKey, sourceFirmwareName);

  return (
    <div class={style}>
      <RouteHeaderBar
        title={`edit project firmware: ${editFirmwareName || '(new)'}`}
        canSave={canSave}
        saveHandler={(canEdit && saveHandler) || undefined}
        backHandler={backHandler}
        editMode={editFirmwareName ? 'Edit' : 'Create'}
      />
      <div class="content">
        <StandardFirmwareEditor />
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
