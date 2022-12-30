import {
  FC,
  asyncRerender,
  css,
  domStyled,
  effectOnMount,
  jsx,
  useInlineEffect,
  useLocal,
} from 'alumina';
import {
  IProjectPackage,
  KermiteServerBase64Icon,
  createFallbackProjectPackage,
  reflectValue,
} from '~/app-shared';
import { diOnlineProjectImporter } from '../di';
import {
  ImportResourceSelector,
  createImportResourceSelectorStore,
} from '../importResourceSelector/ImportResourceSelector';
import {
  IServerPackageWrapperItem,
  serverPackagesLoader,
} from './serverPackagesLoader';

function createStore() {
  const importResourceSelectorStore = createImportResourceSelectorStore();

  const state = {
    allPackages: [] as IServerPackageWrapperItem[],
    selectedPackageProjectId: '',
  };

  const readers = {
    get selectedPackage() {
      return state.allPackages.find(
        (pk) => pk.projectId === state.selectedPackageProjectId,
      );
    },
    get canApply() {
      const { importItems } = importResourceSelectorStore.getOutputProps();
      return importItems.length > 0;
    },
  };

  const actions = {
    async loadServerPackages() {
      const packages = await serverPackagesLoader.loaderServerPackages();
      // console.log({ packages });
      state.allPackages = packages;
      asyncRerender();
    },
    setSelectedPackageProjectId(projectId: string) {
      state.selectedPackageProjectId = projectId;
    },
    importProjectSelected() {
      if (!readers.selectedPackage) {
        return;
      }
      const pkg = readers.selectedPackage.data;

      const { importItems } = importResourceSelectorStore.getOutputProps();

      const newProject: IProjectPackage = {
        ...pkg,
        profiles: pkg.profiles.filter((it) =>
          importItems.find(
            (q) => q.itemType === 'profile' && q.itemName === it.name,
          ),
        ),
        layouts: pkg.layouts.filter((it) =>
          importItems.find(
            (q) => q.itemType === 'layout' && q.itemName === it.name,
          ),
        ),
        firmwares: pkg.firmwares.filter((it) =>
          importItems.find(
            (q) => q.itemType === 'firmware' && q.itemName === it.name,
          ),
        ),
      };
      diOnlineProjectImporter.saveProject(newProject);
      diOnlineProjectImporter.close();
    },
  };

  return { state, readers, actions, importResourceSelectorStore };
}

export const OnlineProjectImporterView: FC = () => {
  const store = useLocal(createStore);

  const {
    state: { allPackages, selectedPackageProjectId },
    readers: { selectedPackage: sp },
    actions: {
      loadServerPackages,
      setSelectedPackageProjectId,
      importProjectSelected,
    },
    importResourceSelectorStore,
  } = store;
  effectOnMount(loadServerPackages);

  useInlineEffect(() => {
    importResourceSelectorStore.setInputProps({
      localProject: createFallbackProjectPackage(),
      remoteProject: sp?.data || createFallbackProjectPackage(),
    });
  }, [sp]);

  return domStyled(
    <div>
      <div class="panel">
        online project importer
        <div class="main-row">
          <div class="selection-column">
            <select
              size={20}
              value={selectedPackageProjectId}
              onChange={reflectValue(setSelectedPackageProjectId)}
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
                <li>comment: {sp.comment}</li>
              </ul>
            )}
          </div>
          <div>
            <ImportResourceSelector store={importResourceSelectorStore} />
          </div>
        </div>
        <div>
          <button
            onClick={importProjectSelected}
            disabled={!store.readers.canApply}
          >
            apply
          </button>
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
    `,
  );
};
