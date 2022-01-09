import { jsx, css } from 'alumina';
import { ISelectorOption, texts } from '~/ui/base';
import { FlatListSelector } from '~/ui/components/atoms/FlatListSelector';
import { ClosableOverlay } from '~/ui/components/modals/CommonDialogParts';
import { reflectValue } from '~/ui/utils';

export interface IProjectAttachmentFileSelectorModalModel {
  titleText: string;
  closeModal(): void;
  selectorSize: number;

  canSelectProject: boolean;
  projectOptions: ISelectorOption[];
  currentProjectKey: string;
  setCurrentProjectKey(projectKey: string): void;
  currentProjectKeyboardName: string;

  attachmentFileTypeHeader: string;
  attachmentFileNameOptions: ISelectorOption[];
  currentAttachmentFileName: string;
  setCurrentAttachmentFileName(fileName: string): void;
  targetAttachmentFilePath: string;

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
    currentProjectKey,
    setCurrentProjectKey,
    currentProjectKeyboardName,
    attachmentFileTypeHeader,
    attachmentFileNameOptions,
    currentAttachmentFileName,
    setCurrentAttachmentFileName,
    targetAttachmentFilePath,
    buttonText,
    buttonActive,
    buttonHandler,
  } = props.vm;

  return (
    <ClosableOverlay close={closeModal}>
      <div class={cssPanel}>
        <div class="panelHeader">
          <div class="titleText">{titleText}</div>
          <div class="closeButton" onClick={closeModal}>
            <i class="fa fa-times" />
          </div>
        </div>
        <div class="panelBody">
          <div class={cssProjectLayoutContent}>
            <div class="primaryRow">
              <div class="column listColumn">
                <div>{texts.projectAttachmentFileSelectionModal.project}</div>
                <FlatListSelector
                  options={projectOptions}
                  value={currentProjectKey}
                  setValue={setCurrentProjectKey}
                  size={selectorSize}
                  disabled={!canSelectProject}
                />
                <div class="keyboardNameText">{currentProjectKeyboardName}</div>
              </div>
              <div class="column listColumn">
                <div>{attachmentFileTypeHeader}</div>
                <FlatListSelector
                  options={attachmentFileNameOptions}
                  value={currentAttachmentFileName}
                  setValue={setCurrentAttachmentFileName}
                  size={selectorSize}
                />
                <div>
                  <input
                    class="layoutNameEdit"
                    type="text"
                    value={currentAttachmentFileName}
                    onInput={reflectValue(setCurrentAttachmentFileName)}
                    spellcheck={'false' as any}
                  />
                </div>
              </div>
            </div>
            <div class="bottomRow">
              <div class="filePathText">{targetAttachmentFilePath}</div>
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
