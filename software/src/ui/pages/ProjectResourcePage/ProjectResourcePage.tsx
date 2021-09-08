import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { GeneralButtonMenu } from '~/ui/components';
import { ProjectResourceList } from '~/ui/components/organisms/ProjectResourceList';
import { reflectValue } from '~/ui/helpers';
import { useProjectResourcePageModel } from '~/ui/pages/ProjectResourcePage/models/ProjectResourcePageModel';
import { ResourceItemDetailView } from '~/ui/pages/ProjectResourcePage/organisms/ResourceItemDetailView';

export const ProjectResourcePage: FC = () => {
  const {
    keyboardName,
    handleKeyboardNameChange,
    resourceItemKeys,
    selectedItemKey,
    setSelectedItemKey,
    clearSelection,
    menuItems,
  } = useProjectResourcePageModel();
  return (
    <div css={style}>
      <div className="content">
        <div>project resource edit page</div>
        <div className="top-row">
          <GeneralButtonMenu menuItems={menuItems} />
          <div className="keyboard-name-part">{keyboardName}</div>
        </div>
        <div qxIf={false}>
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
              resourceItemKeys={resourceItemKeys}
              selectedItemKey={selectedItemKey}
              setSelectedItemKey={setSelectedItemKey}
              clearSelection={clearSelection}
            />
          </div>
          <div className="right-column">
            <ResourceItemDetailView
              selectedItemKey={selectedItemKey}
              qxIf={!!selectedItemKey}
            />
          </div>
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
    > .top-row {
      display: flex;
      align-items: center;

      > .keyboard-name-part {
        margin-left: 10px;
      }
    }

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
