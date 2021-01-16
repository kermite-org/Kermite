import { GeneralSelector } from '@ui-layouter/controls';
import {
  ConfigContent,
  ConfigHeader,
  ConfigPanel,
  ConfigVStack,
} from '@ui-layouter/editor/views/SidePanels/atoms';
import { GeneralConfigTextEditRow } from '@ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useKeyEntityEditPanelModel } from '@ui-layouter/editor/views/SidePanels/models/KeyEntityEditPanel.model';
import { css } from 'goober';
import { h } from 'qx';

const cssErrorText = css`
  color: red;
  font-size: 14px;
`;

export const KeyEntityEditPanel = () => {
  const { keyEntityAttrsVm: vm } = useKeyEntityEditPanelModel();
  return (
    <ConfigPanel>
      <ConfigHeader>key properties</ConfigHeader>
      <ConfigContent>
        <ConfigVStack>
          <div>{vm.keyIdentificationText}&nbsp;</div>
          {vm.slots.map((slot, index) => (
            <GeneralConfigTextEditRow
              key={index}
              {...slot}
              labelWidth={80}
              inputWidth={60}
            />
          ))}
          <GeneralConfigTextEditRow
            label="keyIndex"
            {...vm.vmKeyIndex}
            labelWidth={80}
            inputWidth={60}
          />
          <div css={cssErrorText}>{vm.vmKeyIndex.errorText}</div>
          <div>
            <span style={{ width: '80px', display: 'inline-block' }}>
              groupId
            </span>
            <GeneralSelector {...vm.vmGroupId} width={60} />
          </div>
          <div qxIf={!!vm.errorText} css={cssErrorText}>
            {vm.errorText}
          </div>
        </ConfigVStack>
      </ConfigContent>
    </ConfigPanel>
  );
};
