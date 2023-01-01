import { FC, applyGlobalStyle, css, domStyled, jsx, useState } from 'alumina';
import { LayoutEditorView } from '~/feature-layout-editor';
import { OnlineProjectImporterView } from '~/feature-online-project-importer';
import { ProfileEditorView } from '~/feature-profile-editor';
import { appStore } from './appStore';
import { deviceStore } from './deviceStore';
import { globalStyle } from './globalStyle';

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
          <DeviceStatusPanel />
        </div>
        <div class="main-column">
          <EditorAreaContent />
        </div>
      </div>
      <OnlineProjectImporterView if={modalType === 'onlineProjectImporter'} />
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
        overflow-y: hidden;

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
          overflow-y: scroll;
        }
      }
    `,
  );
};

const EditorAreaContent: FC = () => {
  const { editorTargetPath } = appStore.state;

  if (editorTargetPath) {
    const editorType = editorTargetPath.split('/')[1];
    if (editorType === 'profile') {
      return <ProfileEditorView itemPath={editorTargetPath} />;
    }
    if (editorType === 'layout') {
      return <LayoutEditorView itemPath={editorTargetPath} />;
    }
  }
  return <div>no content</div>;
};

const ProjectResourcePanel: FC = () => {
  const { projectName, profiles, layouts, firmwares } =
    appStore.state.currentProject;

  const { openProfileEditor, openLayoutEditor, openFirmwareEditor } =
    appStore.actions;
  return domStyled(
    <div>
      <h3>プロジェクト</h3>
      <div>{projectName}</div>
      <div class="entities-row">
        <ul>
          {profiles.map((item) => (
            <li key={item.name} onClick={() => openProfileEditor(item.name)}>
              <ProjectItemIcon text="P" />
              {item.name}
            </li>
          ))}
        </ul>
        <ul>
          {layouts.map((item) => (
            <li key={item.name} onClick={() => openLayoutEditor(item.name)}>
              <ProjectItemIcon text="L" />
              {item.name}
            </li>
          ))}
        </ul>
        <ul>
          {firmwares.map((item) => (
            <li key={item.name} onClick={() => openFirmwareEditor(item.name)}>
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
          cursor: pointer;
        }
      }
    `,
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
    `,
  );
};

const DeviceStatusPanel: FC = () => {
  const { openNewDevice, closeDevice } = deviceStore.actions;
  const { currentDeviceProductName } = deviceStore.readers;
  return domStyled(
    <div>
      <div>device</div>
      <div>{currentDeviceProductName}</div>
      <div>
        <button onClick={openNewDevice}>connect</button>
        <button onClick={closeDevice}>close</button>
      </div>
    </div>,
    css``,
  );
};

const MenuBar: FC = () => {
  const { actions } = appStore;
  const handleCreateProjectFromOnline = () =>
    actions.openModel('onlineProjectImporter');
  const handleCreateBlankProject = actions.loadBlankProject;

  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  return domStyled(
    <div class={!isOpen && '--folded'}>
      <ul>
        <li onClick={toggleOpen}>プロジェクト</li>
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
        <li onClick={toggleOpen}>編集</li>
        <li onClick={undefined}>-元に戻す</li>
        <li onClick={undefined}>-やり直し</li>
      </ul>
    </div>,
    css`
      display: flex;
      gap: 20px;

      > ul {
        > li:first-child {
          cursor: default;
        }
        > li:not(:first-child) {
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }

      &.--folded {
        height: 26px;
        overflow: hidden;
      }
    `,
  );
};
