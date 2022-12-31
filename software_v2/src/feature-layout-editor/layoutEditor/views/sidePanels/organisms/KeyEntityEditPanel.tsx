import { FC, css, jsx } from 'alumina';
import {
  ConfigPanelBox,
  ConfigVStack,
  GeneralConfigTextEditRow,
  GeneralSelector,
  HFlex,
} from '~/fe-shared-2';
import { editReader } from '../../../models';
import { useKeyEntityEditPanelModel } from '../models';

export const KeyEntityEditPanel: FC = () => {
  const { keyEntityAttrsVm: vm } = useKeyEntityEditPanelModel();

  const reflectInput =
    editReader.enableKeyIndexReflection &&
    editReader.currentKeyEntity &&
    editReader.pressedKeyIndices.length > 0;

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
          class={[cssKeyIndexInput, reflectInput && '--reflect-input']}
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

const cssKeyIndexInput = css`
  &.--reflect-input {
    > input {
      background: #0f04;
    }
  }
`;
