import { css, FC, jsx } from 'qx';
import { ClosableOverlay } from '~/ui/components';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import { CustomFirmwareEditor } from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor';
import { useProjectCustomFirmwareSetupModalModel } from '~/ui/pages/ProjectCustomFirmwareSetupModal.model';

type Props = {
  variationId: string;
  close(): void;
};

export const ProjectCustomFirmwareSetupModal: FC<Props> = ({
  variationId,
  close,
}) => {
  const { sourceEditValues, canSave, saveHandler } =
    useProjectCustomFirmwareSetupModalModel(variationId, close);
  const { variationName } = sourceEditValues;
  return (
    <ClosableOverlay close={close}>
      <div css={style}>
        <RouteHeaderBar
          title={`edit custom firmware :${variationName}`}
          canSave={canSave}
          saveHandler={saveHandler}
        />
        <div className="content">
          <CustomFirmwareEditor editValues={sourceEditValues} />
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
