import { css, FC, jsx } from 'qx';
import { Link } from '~/ui/base';
import { usePlayerModel } from '~/ui/commonModels';
import { EditorKeyboardView } from '~/ui/components_svg';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { profilesModel } from '~/ui/pages/editor-page/ui_bar_profileManagement/viewModels/ProfileManagementPartViewModel';
import { makeEditKeyUnitCardsPartViewModel } from '~/ui/pages/editor-page/ui_editor_keyboardSection/EditKeyUnitCardsPartViewModel';
import { LayerStateView } from './LayerStateView';

const ProfileSetupNavigationCardView: FC = () => {
  const style = css`
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    > .card {
      width: 400px;
      height: 120px;
      border: solid 1px rgba(90, 90, 90, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;

      > p {
        line-height: 1.5em;

        .link {
          display: inline-block;
          color: #23f;
          cursor: pointer;
        }
      }
    }
  `;
  return (
    <div css={style}>
      <div className="card">
        <p>
          No profiles available. <br />
          Create first profile in &nbsp;
          <Link to="/presetBrowser" className="link">
            presets
          </Link>
          &nbsp; page.
        </p>
      </div>
    </div>
  );
};

export function KeyboardSection() {
  const playerModel = usePlayerModel();

  const cssKeyboardSection = css`
    position: relative;
    height: 100%;
  `;
  const { clearAssignSlotSelection } = editorModel;

  playerModel.setProfileData(editorModel.profileData);

  const cardsPartVm = makeEditKeyUnitCardsPartViewModel(
    playerModel,
    editorModel,
  );

  if (
    profilesModel.allProfileNames.length === 0 &&
    profilesModel.loadedProfileReceived &&
    !profilesModel.profileLoaded
  ) {
    // Profileが存在しない場合、presetBrowserへの導線を表示
    return <ProfileSetupNavigationCardView />;
  }

  return (
    <div css={cssKeyboardSection} onMouseDown={clearAssignSlotSelection}>
      <EditorKeyboardView
        cards={cardsPartVm.cards}
        showLayerDefaultAssign={cardsPartVm.showLayerDefaultAssign}
        design={editorModel.displayDesign}
      />
      <LayerStateView playerModel={playerModel} />
    </div>
  );
}
