import { css } from 'goober';
import { h } from 'qx';
import { reflectValue } from '~/ui-common';
import { useLayoutManagerViewModel } from '~/ui-layouter-page/LayoutManagerModel';

const cssPartBox = css`
  border: solid 1px #888;
  padding: 10px;
`;
const PartBox = ({ title, children }: { title: string; children: any }) => {
  return (
    <div css={cssPartBox}>
      <div>{title}</div>
      <div>{children}</div>
    </div>
  );
};

const cssRoot = css`
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  background: #fff;

  > .topRow {
    flex-shrink: 0;
  }
  > .mainRow {
    flex-grow: 1;
    display: flex;

    > .textEditColumn {
      flex-grow: 1;
      /* border: solid 1px #888; */

      > textArea {
        width: 100%;
        height: 100%;
        padding: 5px;
      }
    }

    > .managementColumn {
      width: 500px;
      border: solid 1px #888;
      padding: 4px;

      > * + * {
        margin-top: 4px;
      }
    }
  }

  .operationsArea {
    button {
      height: 28px;
      width: 140px;
      padding: 5px;
      margin: 2px;
      cursor: pointer;
    }
  }
`;

const cssProjectLayoutContent = css`
  > * {
    margin-top: 5px;
  }
  > .primaryRow {
    display: flex;

    > .column {
      padding: 10px;
      border: solid 1px #888;
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
  }

  input {
    width: 100px;
    height: 28px;
  }

  button {
    height: 28px;
    width: 80px;
    padding: 5px;
    margin: 2px;
    cursor: pointer;
  }
`;
export const UiLayouterPageDevelopmentDummy = () => {
  const vm = useLayoutManagerViewModel();

  return (
    <div css={cssRoot}>
      <div>Edit Layout Manager, Mock Development Page</div>
      <div class="mainRow">
        <div class="textEditColumn">
          <textarea
            placeholder="テキスト編集領域, レイアウトのJSONをここで編集"
            value={vm.editDesignText}
            onInput={reflectValue(vm.setEditDesignText)}
          ></textarea>
        </div>
        <div class="managementColumn">
          <PartBox title="EditSource">
            <pre>{JSON.stringify(vm.editSource)}</pre>
          </PartBox>
          <PartBox title="Project Layout Files">
            <div css={cssProjectLayoutContent}>
              <div class="primaryRow">
                <div class="column listColumn">
                  <div>Project</div>
                  <select
                    size={5}
                    value={vm.currentProjectId}
                    onInput={reflectValue(vm.setCurrentProjectId)}
                  >
                    {vm.projectOptions.map((it) => (
                      <option value={it.id} key={it.id}>
                        {it.text}
                      </option>
                    ))}
                  </select>
                  <div>{vm.currentProjectPath}</div>
                  <div>{vm.currentKeyboardName}</div>
                </div>
                <div class="column listColumn">
                  <div>Layout</div>
                  <select
                    size={5}
                    value={vm.currentLayoutName}
                    onChange={reflectValue(vm.setCurrentLayoutName)}
                  >
                    {vm.layoutOptions.map((it) => (
                      <option value={it.id} key={it.id}>
                        {it.text}
                      </option>
                    ))}
                  </select>
                  <div>
                    <input
                      type="text"
                      value={vm.currentLayoutName}
                      onInput={reflectValue(vm.setCurrentLayoutName)}
                    ></input>
                  </div>
                </div>
                <div class="column">
                  <button
                    onClick={vm.loadFromProject}
                    disabled={!vm.canLoadFromProject}
                  >
                    Load
                  </button>
                  <button
                    onClick={vm.saveToProject}
                    disabled={!vm.canSaveToProject}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div class="bottomRow">{vm.targetProjectLayoutFilePath}</div>
            </div>
          </PartBox>
          <PartBox title="Operations">
            <div class="operationsArea">
              <div>
                <button onClick={vm.createNewLayout}>Create New Layout</button>
                <button onClick={vm.loadCurrentProfileLayout}>
                  Edit Current Profile
                </button>
              </div>
              <div>
                <button onClick={vm.loadFromFileWithDialog}>
                  Load From File
                </button>
                <button onClick={vm.saveToFileWithDialog}>Save To File</button>
              </div>
              <div>
                <button
                  disabled={!vm.canOverwrite}
                  onClick={vm.overwriteLayout}
                >
                  Overwrite
                </button>
              </div>
            </div>
          </PartBox>
        </div>
      </div>
    </div>
  );
};
