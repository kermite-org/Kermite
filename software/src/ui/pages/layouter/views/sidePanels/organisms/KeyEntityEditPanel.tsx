import { jsx, css } from 'qx';
import { HFlex, GeneralSelector } from '~/ui/components';
import { ConfigVStack } from '~/ui/pages/layouter/views/sidePanels/atoms';
import { ConfigPanelBox } from '~/ui/pages/layouter/views/sidePanels/atoms/ConfigPanelBox';
import { useKeyEntityEditPanelModel } from '~/ui/pages/layouter/views/sidePanels/models/KeyEntityEditPanel.model';
import { GeneralConfigTextEditRow } from '~/ui/pages/layouter/views/sidePanels/molecules/GeneralConfigTextEditRow';

const cssErrorText = css`
  color: red;
  font-size: 14px;
`;

export const KeyEntityEditPanel = () => {
  const { keyEntityAttrsVm: vm } = useKeyEntityEditPanelModel();
  return (
    <ConfigPanelBox headerText="key properties">
      <ConfigVStack>
        <div>{vm.keyIdentificationText}&nbsp;</div>
        <GeneralConfigTextEditRow
          label="editKeyId"
          {...vm.vmKeyId}
          labelWidth={80}
          inputWidth={60}
          qxIf={vm.showManualEditKeyId}
        />
        <div css={cssErrorText} qxIf={vm.showManualEditKeyId}>
          {vm.vmKeyId.errorText}
        </div>
        {vm.slots.map((slot, index) => (
          <GeneralConfigTextEditRow
            key={index}
            {...slot}
            labelWidth={80}
            inputWidth={80}
          />
        ))}
        <GeneralConfigTextEditRow
          label="keyIndex"
          {...vm.vmKeyIndex}
          labelWidth={80}
          inputWidth={80}
        />
        <div css={cssErrorText}>{vm.vmKeyIndex.errorText}</div>
        <HFlex>
          <span style={{ width: '80px' }}>groupId</span>
          <GeneralSelector {...vm.vmGroupId} width={80} />
        </HFlex>
        <div qxIf={!!vm.errorText} css={cssErrorText}>
          {vm.errorText}
        </div>
      </ConfigVStack>
    </ConfigPanelBox>
  );
};
