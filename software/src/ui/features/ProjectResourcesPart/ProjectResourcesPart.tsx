import { css, FC, jsx } from 'alumina';
import { GeneralButtonMenu } from '~/ui/components';
import { ProjectResourceItemView } from '~/ui/fabrics/ProjectResourceItemView/ProjectResourceItemView';
import { ProjectResourceList } from '~/ui/fabrics/ProjectResourceList';
import { useProjectResourcePageModel } from '~/ui/features/ProjectResourcesPart/models/ProjectResourcePageModel';
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
    editProjectInfo,
    openDetailView,
  } = useProjectResourcePageModel();

  return (
    <div css={style}>
      <div class="top-row">
        <GeneralButtonMenu menuItems={menuItems} />
        <div class="keyboard-name-part">{keyboardName}</div>
      </div>
      <div if={false}>
        <label>
          <span>keyboard name</span>
          <input
            class="keyboard-name-input"
            type="text"
            value={keyboardName}
            onChange={reflectValue(handleKeyboardNameChange)}
          />
        </label>
      </div>
      <div class="main-row">
        <div class="left-column">
          <ProjectResourceList
            class="items-box"
            resourceItemKeys={resourceItemKeys}
            selectedItemKey={selectedItemKey}
            setSelectedItemKey={setSelectedItemKey}
            clearSelection={clearSelection}
          />
        </div>
        <div class="right-column">
          <ProjectResourceItemView
            selectedItemKey={selectedItemKey}
            if={!!selectedItemKey}
            projectInfo={editProjectInfo}
            detailButtonText="edit"
            onDetailButton={openDetailView}
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
