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

function createStore() {
  const state = {
    allPackages: [] as IServerPackageWrapperItem[],
    selectedPackageProjectId: "",
  };

  const readers = {
    get selectedPackage() {
      return state.allPackages.find(
        (pk) => pk.projectId === state.selectedPackageProjectId
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
    setSelectedPackageProjectId(projectId: string) {
      state.selectedPackageProjectId = projectId;
    },
    importProjectSelected() {
      const pkg = readers.selectedPackage;
      if (pkg) {
        diOnlineProjectImporter.saveProject(pkg.data);
        diOnlineProjectImporter.close();
      }
    },
  };
  return { state, readers, actions };
}

const store = createStore();

export const OnlineProjectImporterView: FC = () => {
  const {
    state: { allPackages, selectedPackageProjectId },
    readers: { selectedPackage: sp },
    actions: {
      loadServerPackages,
      setSelectedPackageProjectId,
      importProjectSelected,
    },
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
              value={selectedPackageProjectId}
              onChange={reflectValue(setSelectedPackageProjectId) as any}
            >
              {allPackages.map((pk) => (
                <option key={pk.projectId} value={pk.projectId}>
                  {pk.keyboardName}
                </option>
              ))}
            </select>
          </div>
          <div class="detail-column">
            {sp && (
              <ul>
                <li>projectId: {sp.projectId}</li>
                <li>keyboardName: {sp.keyboardName}</li>
                <li>authorName: {sp.authorDisplayName}</li>
                <li>
                  icon:
                  <KermiteServerBase64Icon
                    class="user-icon"
                    iconUrl={sp.authorIconUrl}
                  />
                </li>
                <li>createdByBoardAuthor: {sp.isOfficial.toString()}</li>
                <li>underDevelopment: {sp.isDevelopment.toString()}</li>
                <li>default layout: layout goes here</li>
              </ul>
            )}
          </div>
        </div>
        <div>
          <button onClick={importProjectSelected}>apply</button>
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
