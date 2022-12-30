import { applyGlobalStyle, css, domStyled, FC, jsx } from "alumina";
import { appStore } from "./appStore";
import { globalStyle } from "./globalStyle";
import { OnlineProjectImporterView } from "~/feature-online-project-importer";

const MenuBar: FC = () => {
  const { actions } = appStore;
  const handleCreateProjectFromOnline = () =>
    actions.openModel("onlineProjectImporter");
  const handleCreateBlankProject = actions.loadBlankProject;

  return domStyled(
    <div>
      <ul>
        <li>プロジェクト</li>
        <li onClick={handleCreateProjectFromOnline}>
          -新規作成(オンラインから)
        </li>
        <li onClick={handleCreateBlankProject}>-新規作成(空のプロジェクト)</li>
        <li onClick={undefined}>-プロジェクト設定</li>
        <li onClick={undefined}>-エクスポート</li>
        <li>--------</li>
        <li onClick={undefined}>-キーマップ作成</li>
        <li onClick={undefined}>-レイアウト作成</li>
        <li onClick={undefined}>-ファームウェア作成</li>
      </ul>
      <ul>
        <li>編集</li>
        <li onClick={undefined}>-元に戻す</li>
        <li onClick={undefined}>-やり直し</li>
      </ul>
    </div>,
    css`
      display: flex;
      gap: 20px;

      > ul {
        > li:not(:first-child) {
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    `
  );
};

const ProjectItemIcon: FC<{ text: string }> = ({ text }) => {
  return domStyled(
    <div>{text}</div>,
    css`
      display: inline-flex;
      width: 26px;
      height: 26px;
      flex-shrink: 0;
      justify-content: center;
      align-items: center;
      border: solid 1px #222;
    `
  );
};

const ProjectResourcePanel: FC = () => {
  const { projectName, profiles, layouts, firmwares } =
    appStore.state.currentProject;
  return domStyled(
    <div>
      <h3>プロジェクト</h3>
      <div>{projectName}</div>
      <div class="entities-row">
        <ul>
          {profiles.map((item) => (
            <li>
              <ProjectItemIcon text="P" />
              {item.name}
            </li>
          ))}
        </ul>
        <ul>
          {layouts.map((item) => (
            <li>
              <ProjectItemIcon text="L" />
              {item.name}
            </li>
          ))}
        </ul>
        <ul>
          {firmwares.map((item) => (
            <li>
              <ProjectItemIcon text="F" />
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    css`
      > .entities-row {
        display: flex;
        flex-direction: column;
        > ul > li {
          padding: 3px 0;
          display: flex;
          align-items: center;
          gap: 3px;
        }
      }
    `
  );
};

export const PageRoot: FC = () => {
  applyGlobalStyle(globalStyle);

  const { modalType } = appStore.state;
  return domStyled(
    <div>
      <div class="app-title-bar">Kermite</div>
      <div class="top-bar">
        <MenuBar />
      </div>
      <div class="main-row">
        <div class="side-bar">
          <ProjectResourcePanel />
          <div>デバイス</div>
        </div>
        <div class="main-column">editor</div>
      </div>
      <OnlineProjectImporterView if={modalType === "onlineProjectImporter"} />
    </div>,
    css`
      height: 100%;
      display: flex;
      flex-direction: column;

      > .app-title-bar {
        flex-shrink: 0;
        background: #08f;
        padding: 2px 5px;
        color: #fff;
      }

      > .top-bar {
        flex-shrink: 0;
        background: #ddd;
        padding: 2px 5px;
      }
      > .main-row {
        flex-grow: 1;

        display: flex;
        > .side-bar {
          width: 180px;
          flex-shrink: 0;
          border: solid 1px #aaa;
          border-right: none;
          padding: 5px;

          display: flex;
          flex-direction: column;

          > div:nth-child(2) {
            margin-top: auto;
          }
        }
        > .main-column {
          flex-grow: 1;
          border: solid 1px #aaa;
          padding: 5px;
        }
      }
    `
  );
};
