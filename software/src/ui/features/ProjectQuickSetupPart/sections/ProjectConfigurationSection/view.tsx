import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { GeneralInput } from '~/ui/components';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

export const ProjectConfigurationSection: FC = () => (
  <div class={style}>
    <div class="row">
      <div className="field-name">Keyboard Name</div>
      <div>
        <GeneralInput
          value={projectQuickSetupStore.state.keyboardName}
          setValue={projectQuickSetupStore.actions.setKeyboardName}
        />
      </div>
    </div>
  </div>
);

const style = css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;

  > .row {
    display: flex;
    align-items: center;

    > .field-name {
      margin-right: 10px;
    }
  }
`;
