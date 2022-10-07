import { asyncRerender, css, domStyled, effectOnMount, FC, jsx } from "alumina";
import { reflectValue } from "~/funcs";
import { KermiteServerBase64Icon } from "~/components";
import {
  IServerPackageWrapperItem,
  serverPackagesLoader,
} from "./serverPackagesLoader";

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

function createStore() {
  const state = {
    allPackages: [] as IServerPackageWrapperItem[],
    selectedProjectId: "",
  };

  const readers = {
    get selectedProject() {
      return state.allPackages.find(
        (pk) => pk.projectId === state.selectedProjectId
      );
    },
  };

  const actions = {
    async loadServerPackages() {
      const packages = await serverPackagesLoader.loaderServerPackages();
      console.log({ packages });
      state.allPackages = packages;
      asyncRerender();
    },
    setProjectSelected(projectId: string) {
      state.selectedProjectId = projectId;
    },
  };
  return { state, readers, actions };
}

const store = createStore();

export const OnlineProjectImporterView: FC = () => {
  const {
    state: { allPackages, selectedProjectId },
    readers: { selectedProject },
    actions: { loadServerPackages, setProjectSelected },
  } = store;
  effectOnMount(loadServerPackages);

  return domStyled(
    <div>
      <div class="panel">
        online project importer
        <div class="main-row">
          <div class="selection-column">
            <select
              size={20}
              value={selectedProjectId}
              onChange={reflectValue(setProjectSelected) as any}
            >
              {allPackages.map((pk) => (
                <option key={pk.projectId} value={pk.projectId}>
                  {pk.keyboardName}
                </option>
              ))}
            </select>
          </div>
          <div class="detail-column">
            {selectedProject && (
              <ul>
                <li>projectId: {selectedProject.projectId}</li>
                <li>keyboardName: {selectedProject.keyboardName}</li>
                <li>authorName: {selectedProject.authorDisplayName}</li>
                <li>
                  icon:
                  <KermiteServerBase64Icon
                    class="user-icon"
                    iconUrl={selectedProject.authorIconUrl}
                  />
                </li>
                <li>
                  createdByBoardAuthor: {selectedProject.isOfficial.toString()}
                </li>
                <li>
                  underDevelopment: {selectedProject.isDevelopment.toString()}
                </li>
                <li>default layout: layout goes here</li>
              </ul>
            )}
          </div>
        </div>
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

        > .main-row {
          display: flex;
          gap: 5px;

          > .selection-column {
          }

          > .detail-column {
          }
        }
      }

      select {
        padding: 5px;
        > option {
          padding: 2px 0;
          cursor: pointer;
        }
      }
      .user-icon {
        width: 40px;
        height: 40px;
      }
    `
  );
};
