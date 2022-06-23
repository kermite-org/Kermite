import { jsx, css, FC } from 'alumina';
import { HFlex, GeneralSelector } from '~/ui/components';
import {
  ConfigVStack,
  ConfigPanelBox,
  GeneralConfigTextEditRow,
} from '~/ui/elements';
import { useKeyEntityEditPanelModel } from '~/ui/featureEditors/layoutEditor/views/sidePanels/models/keyEntityEditPanel.model';

export const KeyEntityEditPanel: FC = () => {
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
          if={vm.showManualEditKeyId}
        />
        <div class={cssErrorText} if={vm.showManualEditKeyId}>
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
        <div class={cssErrorText}>{vm.vmKeyIndex.errorText}</div>
        <HFlex>
          <span style={{ width: '80px' }}>groupId</span>
          <GeneralSelector {...vm.vmGroupId} width={80} />
        </HFlex>
        <div if={!!vm.errorText} class={cssErrorText}>
          {vm.errorText}
        </div>
      </ConfigVStack>
    </ConfigPanelBox>
  );
};

const cssErrorText = css`
  color: red;
  font-size: 14px;
`;
