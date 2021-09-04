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
  const { editTargetVariationName, canSave, saveHandler } =
    useProjectCustomFirmwareSetupModalModel(variationId, close);
  return (
    <ClosableOverlay close={close}>
      <div css={style}>
        <RouteHeaderBar
          title={`edit custom firmware :${editTargetVariationName}`}
          canSave={canSave}
          saveHandler={saveHandler}
        />
        <div className="content">
          <CustomFirmwareEditor.render />
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
