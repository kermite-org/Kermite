import { css } from 'goober';
import { h } from 'qx';
import { reflectValue } from '~/ui-common';
import { ILayoutManagerViewModel } from '~/ui-layouter-page/LayoutManagerViewModel';
import { makeCssColor } from '~/ui-layouter/base';
import { ISelectOption } from '~/ui-layouter/controls';

const cssProjectLayoutSelectorModal = css`
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${makeCssColor(0, 0.3)};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const cssPanel = css`
  background: #fff;
  width: 500px;
  border: solid 3px #08f;

  > .panelHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #08f;
    color: #fff;
    padding: 4px 1px;

    > .titleText {
      margin-left: 4px;
    }

    > .closeButton {
      cursor: pointer;
      padding: 0 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
    }
  }

  > .panelBody {
    padding: 15px;
  }
`;

const cssProjectLayoutContent = css`
  > .primaryRow {
    display: flex;

    > .column {
      padding: 10px;
      border: solid 1px #ccc;
      display: flex;
      flex-direction: column;

      > * + * {
        margin-top: 5px;
      }
    }

    > .listColumn {
      flex-basis: 100%;
      flex-grow: 1;
    }
  }

  > .bottomRow {
    margin-top: 10px;
    display: flex;

    > .filePathText {
      flex-grow: 1;
      height: 28px;
      line-height: 28px;
    }
  }

  .keyboardNameText {
    height: 28px;
    line-height: 28px;
  }

  input.layoutNameEdit {
    width: 100px;
    height: 28px;
    padding-left: 4px;
    width: 150px;
  }

  button {
    height: 28px;
    width: 80px;
    padding: 5px;
    margin: 2px;
    cursor: pointer;
  }
`;

const cssFlatListSelector = css`
  padding: 5px;
  font-size: 15px;
`;

const FlatListSelector = (props: {
  options: ISelectOption[];
  value: string;
  setValue: (value: string) => void;
  size: number;
}) => {
  const { options, value, setValue, size } = props;
  return (
    <select
      size={size}
      value={value}
      onInput={reflectValue(setValue)}
      css={cssFlatListSelector}
    >
      {options.map((it) => (
        <option value={it.id} key={it.id}>
          {it.text}
        </option>
      ))}
    </select>
  );
};

export const ProjectLayoutSelectorModal = (props: {
  vm: ILayoutManagerViewModel;
}) => {
  const { vm } = props;
  if (vm.modalState === 'None') {
    return null;
  }
  const isLoading = vm.modalState === 'LoadFromProject';

  const titleText = isLoading
    ? 'Load From Project Layout'
    : 'Save To Project Layout';

  const isCustomName =
    vm.currentLayoutName &&
    !vm.layoutOptions.some((it) => it.id === vm.currentLayoutName);

  const selectorSize = 7;

  return (
    <div css={cssProjectLayoutSelectorModal} onClick={vm.closeModal}>
      <div css={cssPanel} onClick={(e) => e.stopPropagation()}>
        <div class="panelHeader">
          <div class="titleText">{titleText}</div>
          <div class="closeButton" onClick={vm.closeModal}>
            <i class="fa fa-times" />
          </div>
        </div>
        <div class="panelBody">
          <div css={cssProjectLayoutContent}>
            <div class="primaryRow">
              <div class="column listColumn">
                <div>Project</div>
                <FlatListSelector
                  options={vm.projectOptions}
                  value={vm.currentProjectId}
                  setValue={vm.setCurrentProjectId}
                  size={selectorSize}
                />
                <div class="keyboardNameText">{vm.currentKeyboardName}</div>
              </div>
              <div class="column listColumn">
                <div>Layout</div>
                <FlatListSelector
                  options={vm.layoutOptions}
                  value={vm.currentLayoutName}
                  setValue={vm.setCurrentLayoutName}
                  size={selectorSize}
                />
                <div>
                  <input
                    class="layoutNameEdit"
                    type="text"
                    value={vm.currentLayoutName}
                    onInput={reflectValue(vm.setCurrentLayoutName)}
                  ></input>
                </div>
              </div>
            </div>
            <div class="bottomRow">
              <div class="filePathText">{vm.targetProjectLayoutFilePath}</div>
              <div class="buttonBox">
                {isLoading ? (
                  <button
                    onClick={
                      isCustomName ? vm.createForProject : vm.loadFromProject
                    }
                    disabled={!vm.canLoadFromProject}
                  >
                    {isCustomName ? 'Create' : 'Load'}
                  </button>
                ) : (
                  <button
                    onClick={vm.saveToProject}
                    disabled={!vm.canSaveToProject}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
