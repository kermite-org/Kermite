import { css, FC, jsx } from 'alumina';
import { decodeProjectResourceItemKey, IProjectPackageInfo } from '~/shared';
import { GeneralButton } from '~/ui/components';
import { FirmwareDetailView } from '~/ui/fabrics/projectResourceItemView/FirmwareDetailView';
import { LayoutDetailView } from '~/ui/fabrics/projectResourceItemView/LayoutDetailView';
import { PresetDetailView } from '~/ui/fabrics/projectResourceItemView/PresetDetailView';
import { useMemoEx } from '~/ui/utils';

type Props = {
  projectInfo: IProjectPackageInfo;
  selectedItemKey: string;
  detailButtonText: string;
  onDetailButton(): void;
};

function checkCanEdit(
  projectInfo: IProjectPackageInfo,
  selectedItemKey: string,
): boolean {
  const { itemType, itemName } = decodeProjectResourceItemKey(selectedItemKey);
  if (itemType === 'firmware') {
    const firmwareEntry = projectInfo.firmwares.find(
      (fe) => fe.firmwareName === itemName,
    );
    if (firmwareEntry?.type === 'custom') {
      return false;
    }
  }
  return true;
}

export const ProjectResourceItemView: FC<Props> = ({
  projectInfo,
  selectedItemKey,
  detailButtonText,
  onDetailButton,
}) => {
  const { itemType, itemName } = decodeProjectResourceItemKey(selectedItemKey);
  const canEdit = useMemoEx(checkCanEdit, [projectInfo, selectedItemKey]);
  return (
    <div class={style}>
      <div class="header">
        <div>
          {itemType} {itemName}
        </div>
        <GeneralButton onClick={onDetailButton} if={canEdit}>
          {detailButtonText}
        </GeneralButton>
      </div>
      <div class="content-body">
        {itemType === 'profile' && (
          <PresetDetailView projectInfo={projectInfo} presetName={itemName} />
        )}
        {itemType === 'layout' && (
          <LayoutDetailView projectInfo={projectInfo} layoutName={itemName} />
        )}
        {itemType === 'firmware' && (
          <FirmwareDetailView
            projectInfo={projectInfo}
            firmwareName={itemName}
          />
        )}
      </div>
    </div>
  );
};

const style = css`
  padding: 10px;
  > .header {
    display: flex;
    justify-content: space-between;
  }
  > .content-body {
    padding: 10px;
  }
`;
