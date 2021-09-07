import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { ProjectResourceList } from '~/ui/components/organisms/ProjectResourceList';
import { reflectValue } from '~/ui/helpers';
import { useProjectResourcePageModel } from '~/ui/pages/ProjectResourcePage/ProjectResourcePage.model';

export const ProjectResourcePage: FC = () => {
  const {
    keyboardName,
    handleKeyboardNameChange,
    resourceItems,
    createStandardFirmware,
    createCustomFirmware,
  } = useProjectResourcePageModel();
  return (
    <div css={style}>
      <div className="content">
        <div>project resource edit page</div>
        <div>
          <div>
            <button onClick={createStandardFirmware}>
              Create Standard Firmware
            </button>
          </div>
          <div>
            <button onClick={createCustomFirmware}>
              Create Custom Firmware
            </button>
          </div>
        </div>
        <div>
          <label>
            <span>keyboard name</span>
            <input
              className="keyboard-name-input"
              type="text"
              value={keyboardName}
              onChange={reflectValue(handleKeyboardNameChange)}
            />
          </label>
        </div>
        <div className="main-row">
          <div className="left-column">
            <ProjectResourceList
              className="items-box"
              resourceItems={resourceItems}
              selectedItemKey=""
            />
          </div>
          <div className="right-column"></div>
        </div>
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;

  > .content {
    > * + * {
      margin-top: 10px;
    }

    > .main-row {
      display: flex;
      min-height: 400px;
      gap: 10px;
      > .left-column {
        width: 250px;
      }
      > .right-column {
        flex-grow: 1;
        border: solid 1px #888;
      }
    }

    .keyboard-name-input {
      margin-left: 10px;
    }
  }
`;
