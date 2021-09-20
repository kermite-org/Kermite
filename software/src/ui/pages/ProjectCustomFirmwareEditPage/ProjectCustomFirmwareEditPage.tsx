import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectCustomFirmwareEdit } from '~/ui/commonModels';
import { RouteHeaderBar } from '~/ui/components';
import { CustomFirmwareEditor } from '~/ui/editors';
import { useProjectCustomFirmwareEditPageModel } from '~/ui/pages/ProjectCustomFirmwareEditPage/ProjectCustomFirmwareEditPage.model';

type Props = {
  spec: IPageSpec_ProjectCustomFirmwareEdit;
};

export const ProjectCustomFirmwareEditPage: FC<Props> = ({
  spec: { firmwareName: sourceFirmwareName },
}) => {
  const { editFirmwareName, sourceEditValues, canSave, saveHandler } =
    useProjectCustomFirmwareEditPageModel(sourceFirmwareName);
  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit custom firmware: ${editFirmwareName || '(new)'}`}
        backPagePath="/projectResource"
        canSave={canSave}
        saveHandler={saveHandler}
      />
      <div className="content">
        <CustomFirmwareEditor sourceEditValues={sourceEditValues} />
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  > .content {
    padding: 15px;
  }
`;
