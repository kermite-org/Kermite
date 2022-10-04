import { css, domStyled, FC, jsx } from "alumina";

export const diOnlineProjectImporter = {
  saveProject: (_: ILocalProject) => {},
  close: () => {},
};

function emitTestProject() {
  const project: ILocalProject = {
    projectName: "project1",
    keymaps: [{ name: "keymap2" }],
    layouts: [{ name: "layout3" }],
    firmwares: [{ name: "firmware4" }],
  };
  diOnlineProjectImporter.saveProject(project);
  diOnlineProjectImporter.close();
}

export const OnlineProjectImporterView: FC = () => {
  return domStyled(
    <div>
      <div class="panel">
        online project importer
        <div>
          <button onClick={emitTestProject}>apply</button>
          <button onClick={diOnlineProjectImporter.close}>close</button>
        </div>
      </div>
    </div>,
    css`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 80px;
      display: flex;
      justify-content: center;
      align-items: center;

      > .panel {
        border: solid 1px #aaa;
        background: #eee;
        width: 100%;
        height: 100%;
        padding: 10px;
      }
    `
  );
};
