import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { GeneralButton, GeneralInput } from '~/ui/components';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

export const ProjectConfigurationSection: FC = () => {
  const { keyboardName } = projectQuickSetupStore.state;
  const { setKeyboardName, resetConfigurations } =
    projectQuickSetupStore.actions;

  return (
    <div class={style}>
      <div class="edit-part">
        <div className="field-name">Keyboard Name</div>
        <div>
          <GeneralInput value={keyboardName} setValue={setKeyboardName} />
        </div>
      </div>
      <div>
        <GeneralButton onClick={resetConfigurations}>reset</GeneralButton>
      </div>
    </div>
  );
};

const style = css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;

  > .edit-part {
    display: flex;
    align-items: center;

    > .field-name {
      margin-right: 10px;
    }
  }
`;
