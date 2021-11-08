import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import { IPageSpec_ProjectStandardFirmwareEdit } from '~/ui/commonModels';
import { StandardFirmwareEditor } from '~/ui/editors';
import { RouteHeaderBar } from '~/ui/elements/frames';
import { useProjectStandardFirmwareEditPageModel } from '~/ui/pages/ProjectStandardFirmwareEditPage/ProjectStandardFirmwareEditPage.model';

type Props = {
  spec: IPageSpec_ProjectStandardFirmwareEdit;
};

export const ProjectStandardFirmwareEditPage: FC<Props> = ({
  spec: { firmwareName: sourceFirmwareName },
}) => {
  const { editFirmwareName, canSave, saveHandler, backHandler } =
    useProjectStandardFirmwareEditPageModel(sourceFirmwareName);

  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project firmware: ${editFirmwareName || '(new)'}`}
        canSave={canSave}
        saveHandler={saveHandler}
        backHandler={backHandler}
        editMode={editFirmwareName ? 'Edit' : 'Create'}
      />
      <div className="content">
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
