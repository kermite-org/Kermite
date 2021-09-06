import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectFirmwareEdit } from '~/ui/commonModels';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import { StandardFirmwareEditor } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditor';
import { useProjectStandardFirmwareEditPageModel } from '~/ui/pages/ProjectStandardFirmwareEditPage/ProjectStandardFirmwareEditPage.model';

type Props = {
  spec: IPageSpec_ProjectFirmwareEdit;
};

export const ProjectStandardFirmwareEditPage: FC<Props> = ({
  spec: { firmwareResourceId },
}) => {
  const { variationName, standardFirmwareConfig, canSave, saveHandler } =
    useProjectStandardFirmwareEditPageModel(firmwareResourceId);
  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project firmware: ${variationName || '(new)'}`}
        backPagePath="/projectEdit"
        canSave={canSave}
        saveHandler={saveHandler}
      />
      <div className="content">
        <StandardFirmwareEditor firmwareConfig={standardFirmwareConfig} />
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
