import { css } from 'goober';
import { h } from 'qx';

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
  return (
    <div css={cssRoot}>
      <div>Edit Layout Manager, Stub Development Page</div>
      <div class="mainRow">
        <div class="textEditColumn">
          <textarea placeholder="テキスト編集領域, レイアウトのJSONをここで編集"></textarea>
        </div>
        <div class="managementColumn">
          <PartBox title="EditSource">
            <pre>
              {`{
 type: 'ProjectLayout';
 projectId: string;
 layoutName: string;
}`}
            </pre>
          </PartBox>
          <PartBox title="Project Layout Files">
            <div css={cssProjectLayoutContent}>
              <div class="primaryRow">
                <div class="column listColumn">
                  <div>Project</div>
                  <select size={5}></select>
                  <div>astelia</div>
                </div>
                <div class="column listColumn">
                  <div>Layout</div>
                  <select size={5}></select>
                  <div>
                    <input type="text" value="default"></input>
                  </div>
                </div>
                <div class="column">
                  <button>Load</button>
                  <button>Save</button>
                </div>
              </div>
              <div class="bottomRow">projects/astelia/layout.json</div>
            </div>
          </PartBox>
          <PartBox title="Operations">
            <div class="operationsArea">
              <div>
                <button>Create New Layout</button>
                <button>Edit Current Profile</button>
              </div>
              <div>
                <button>Load From File</button>
                <button>Save To File</button>
              </div>
              <div>
                <button disabled={true}>Overwrite</button>
              </div>
            </div>
          </PartBox>
        </div>
      </div>
    </div>
  );
};
