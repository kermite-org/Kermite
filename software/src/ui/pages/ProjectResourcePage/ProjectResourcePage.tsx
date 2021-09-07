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
        <ProjectResourceList
          className="items-box"
          resourceItems={resourceItems}
          selectedItemKey=""
        />
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

    .items-box {
      display: inline-block;
      border: solid 1px #888;
      color: ${uiTheme.colors.clAltText};
      padding: 10px;

      > * + * {
        margin-top: 5px;
      }

      button {
        margin-left: 5px;
      }
    }

    .keyboard-name-input {
      margin-left: 10px;
    }

    pre {
      border: solid 1px #888;
      color: #222;
      padding: 10px;
      width: 300px;
      font-size: 14px;
    }
  }
`;
