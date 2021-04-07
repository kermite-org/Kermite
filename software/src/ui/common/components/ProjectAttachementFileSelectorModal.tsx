import { jsx, css } from 'qx';
import { ISelectorOption, reflectValue } from '~/ui/common';
import { FlatListSelector } from '~/ui/common/components/controls/FlatListSelector';
import { ClosableOverlay } from '~/ui/common/fundamental/dialog/CommonDialogParts';

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

export interface IProjectAttachmentFileSelectorModalModel {
  titleText: string;
  closeModal(): void;
  selectorSize: number;

  canSelectProject: boolean;
  projectOptions: ISelectorOption[];
  currentProjectId: string;
  setCurrentProjectId(projectId: string): void;
  currentProejctKeyboardName: string;

  attachmentFileTypeHeader: string;
  attachmentFileNameOptions: ISelectorOption[];
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
    <ClosableOverlay close={closeModal}>
      <div css={cssPanel}>
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
    </ClosableOverlay>
  );
};
