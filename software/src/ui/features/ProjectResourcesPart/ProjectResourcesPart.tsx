import { css, FC, jsx } from 'alumina';
import { GeneralButtonMenu } from '~/ui/components';
import { ProjectResourceList } from '~/ui/fabrics/ProjectResourceList';
import { useProjectResourcePageModel } from '~/ui/features/ProjectResourcesPart/models/ProjectResourcePageModel';
import { ResourceItemDetailView } from '~/ui/features/ProjectResourcesPart/organisms/ResourceItemDetailView';
import { reflectValue } from '~/ui/utils';

export const ProjectResourcesPart: FC = () => {
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
  );
};

const style = css`
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
`;
