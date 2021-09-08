import { css, FC, jsx } from 'qx';
import { decodeProjectResourceItemKey } from '~/shared';
import { GeneralButton } from '~/ui/components';
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core';
import { FirmwareDetailView } from '~/ui/pages/ProjectResourcePage/organisms/FirmwareDetailView';
import { LayoutDetailView } from '~/ui/pages/ProjectResourcePage/organisms/LayoutDetailView';
import { PresetDetailView } from '~/ui/pages/ProjectResourcePage/organisms/PresetDetailView';

type Props = {
  className?: string;
  selectedItemKey: string;
};

export const ResourceItemDetailView: FC<Props> = ({ selectedItemKey }) => {
  const { itemType, itemName } = decodeProjectResourceItemKey(selectedItemKey);
  const { editSelectedResourceItem } = projectResourceActions;

  return (
    <div css={style}>
      <div className="header">
        <div>
          {itemType} {itemName}
        </div>
        <GeneralButton onClick={() => editSelectedResourceItem()}>
          edit
        </GeneralButton>
      </div>
      <div className="content-body">
        {itemType === 'preset' && <PresetDetailView presetName={itemName} />}
        {itemType === 'layout' && <LayoutDetailView layoutName={itemName} />}
        {itemType === 'firmware' && (
          <FirmwareDetailView firmwareName={itemName} />
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
