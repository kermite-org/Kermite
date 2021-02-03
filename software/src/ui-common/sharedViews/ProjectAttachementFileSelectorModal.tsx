import { css } from 'goober';
import { h } from 'qx';
import { reflectValue } from '~/ui-common';
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
  disabled?: boolean;
}) => {
  const { options, value, setValue, size, disabled } = props;
  return (
    <select
      size={size}
      value={value}
      onInput={reflectValue(setValue)}
      css={cssFlatListSelector}
      disabled={disabled}
    >
      {options.map((it) => (
        <option value={it.id} key={it.id}>
          {it.text}
        </option>
      ))}
    </select>
  );
};

export interface IProjectAttachmentFileSelectorModalModel {
  titleText: string;
  closeModal(): void;
  selectorSize: number;

  canSelectProject: boolean;
  projectOptions: ISelectOption[];
  currentProjectId: string;
  setCurrentProjectId(projectId: string): void;
  currentProejctKeyboardName: string;

  attachmentFileTypeHeader: string;
  attachmentFileNameOptions: ISelectOption[];
  currentAttachmentFileName: string;
  setCurrentAttachmentFileName(fileName: string): void;
  targetAttachementFilePath: string;

  buttonText: string;
  buttonActive: boolean;
  buttonHandler(): void;
}

export const ProjectAttachmentFileSelectorModal = (props: {
  vm: IProjectAttachmentFileSelectorModalModel;
}) => {
  const {
    titleText,
    closeModal,
    selectorSize,
    canSelectProject,
    projectOptions,
    currentProjectId,
    setCurrentProjectId,
    currentProejctKeyboardName,
    attachmentFileTypeHeader,
    attachmentFileNameOptions: attachementFileNameOptions,
    currentAttachmentFileName: currentAttachementFileName,
    setCurrentAttachmentFileName,
    targetAttachementFilePath,
    buttonText,
    buttonActive,
    buttonHandler,
  } = props.vm;

  return (
    <div css={cssProjectLayoutSelectorModal} onClick={closeModal}>
      <div css={cssPanel} onClick={(e) => e.stopPropagation()}>
        <div class="panelHeader">
          <div class="titleText">{titleText}</div>
          <div class="closeButton" onClick={closeModal}>
            <i class="fa fa-times" />
          </div>
        </div>
        <div class="panelBody">
          <div css={cssProjectLayoutContent}>
            <div class="primaryRow">
              <div class="column listColumn">
                <div>Project</div>
                <FlatListSelector
                  options={projectOptions}
                  value={currentProjectId}
                  setValue={setCurrentProjectId}
                  size={selectorSize}
                  disabled={!canSelectProject}
                />
                <div class="keyboardNameText">{currentProejctKeyboardName}</div>
              </div>
              <div class="column listColumn">
                <div>{attachmentFileTypeHeader}</div>
                <FlatListSelector
                  options={attachementFileNameOptions}
                  value={currentAttachementFileName}
                  setValue={setCurrentAttachmentFileName}
                  size={selectorSize}
                />
                <div>
                  <input
                    class="layoutNameEdit"
                    type="text"
                    value={currentAttachementFileName}
                    onInput={reflectValue(setCurrentAttachmentFileName)}
                  ></input>
                </div>
              </div>
            </div>
            <div class="bottomRow">
              <div class="filePathText">{targetAttachementFilePath}</div>
              <div class="buttonBox">
                <button onClick={buttonHandler} disabled={!buttonActive}>
                  {buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};