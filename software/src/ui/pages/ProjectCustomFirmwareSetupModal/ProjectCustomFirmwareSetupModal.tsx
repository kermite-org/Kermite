import { css, FC, jsx } from 'qx';
import { ClosableOverlay } from '~/ui/components';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import { CustomFirmwareEditor } from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor';
import { useProjectCustomFirmwareSetupModalModel } from '~/ui/pages/ProjectCustomFirmwareSetupModal/ProjectCustomFirmwareSetupModal.model';

type Props = {
  firmwareName: string;
  close(): void;
};

export const ProjectCustomFirmwareSetupModal: FC<Props> = ({
  firmwareName,
  close,
}) => {
  const { sourceEditValues, canSave, saveHandler } =
    useProjectCustomFirmwareSetupModalModel(firmwareName, close);
  return (
    <ClosableOverlay close={close}>
      <div css={style}>
        <RouteHeaderBar
          title={`edit custom firmware: ${firmwareName || '(new)'}`}
          canSave={canSave}
          saveHandler={saveHandler}
        />
        <div className="content">
          <CustomFirmwareEditor sourceEditValues={sourceEditValues} />
        </div>
      </div>
    </ClosableOverlay>
  );
};

const style = css`
  background: #fff;
  width: 450px;
  min-height: 150px;

  > .content {
    padding: 10px;
  }
`;
