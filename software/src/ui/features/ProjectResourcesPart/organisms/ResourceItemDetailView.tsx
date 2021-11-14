import { css, FC, jsx } from 'alumina';
import { decodeProjectResourceItemKey } from '~/shared';
import { GeneralButton } from '~/ui/components';
import { FirmwareDetailView } from '~/ui/features/ProjectResourcesPart/organisms/FirmwareDetailView';
import { LayoutDetailView } from '~/ui/features/ProjectResourcesPart/organisms/LayoutDetailView';
import { PresetDetailView } from '~/ui/features/ProjectResourcesPart/organisms/PresetDetailView';
import { projectResourceStore } from '~/ui/features/ProjectResourcesPart/store';
import { useMemoEx } from '~/ui/utils';

type Props = {
  className?: string;
  selectedItemKey: string;
};

function checkCanEdit(selectedItemKey: string): boolean {
  const { itemType, itemName } = decodeProjectResourceItemKey(selectedItemKey);
  if (itemType === 'firmware') {
    const firmwareEntry =
      projectResourceStore.helpers.getFirmwareEntry(itemName);
    if (firmwareEntry?.type === 'custom') {
      return false;
    }
  }
  return true;
}

export const ResourceItemDetailView: FC<Props> = ({ selectedItemKey }) => {
  const { itemType, itemName } = decodeProjectResourceItemKey(selectedItemKey);
  const { editSelectedResourceItem } = projectResourceStore.actions;
  const canEdit = useMemoEx(checkCanEdit, [selectedItemKey]);
  return (
    <div css={style}>
      <div className="header">
        <div>
          {itemType} {itemName}
        </div>
        <GeneralButton onClick={() => editSelectedResourceItem()} if={canEdit}>
          edit
        </GeneralButton>
      </div>
      <div className="content-body">
        {itemType === 'profile' && <PresetDetailView presetName={itemName} />}
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
