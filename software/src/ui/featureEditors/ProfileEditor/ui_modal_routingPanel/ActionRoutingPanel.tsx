import { css, FC, jsx } from 'alumina';
import { IMappingEntry } from '~/shared';
import { generateNextSequentialId } from '~/shared/funcs/DomainRelatedHelpers';
import { colors } from '~/ui/base';
import { GeneralButton, GeneralSelector } from '~/ui/components';
import { GeneralSelectorN } from '~/ui/components/atoms/GeneralSelectorN';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import {
  getRoutingChannelOptions,
  getRoutingTargetKeyOptions,
  getRoutingTargetModifierOptions,
} from '~/ui/featureEditors/ProfileEditor/ui_modal_routingPanel/ActionRoutingPanelModel';
import { commitUiState } from '~/ui/store';

const actions = {
  addMappingEntry() {
    const newId = generateNextSequentialId(
      're-',
      assignerModel.profileData.mappingEntries.map((it) => it.itemId),
    );
    const entry: IMappingEntry = {
      itemId: newId,
      channelIndex: 0,
      srcKey: 'K_NONE',
      srcModifiers: 0,
      dstKey: 'K_NONE',
      dstModifiers: 0,
    };
    assignerModel.patchEditProfileData((profile) =>
      profile.mappingEntries.push(entry),
    );
  },

  deleteLastMappingEntry() {
    assignerModel.patchEditProfileData((profile) => {
      if (profile.mappingEntries.length > 0) {
        profile.mappingEntries.pop();
      }
    });
  },
  handleClose() {
    commitUiState({ profileRoutingPanelVisible: false });
  },
};

const helpers = {
  itemValueSetter<K extends keyof IMappingEntry>(index: number, key: K) {
    return (value: IMappingEntry[K]) => {
      assignerModel.patchEditProfileData(
        (profile) => (profile.mappingEntries[index][key] = value),
      );
    };
  },
};

export const ActionRoutingPanel: FC = () => {
  const { mappingEntries } = assignerModel.profileData;
  const { addMappingEntry, deleteLastMappingEntry, handleClose } = actions;
  const { itemValueSetter } = helpers;

  return (
    <div css={style}>
      <div class="overlay" onClick={handleClose} />
      <div class="panel">
        <div class="closeButton" onClick={handleClose}>
          <i class="fa fa-times" />
        </div>

        <div class="topArea">
          <p>Dynamic Action Routing</p>
          <GeneralButton onClick={addMappingEntry}>add</GeneralButton>
          <GeneralButton onClick={deleteLastMappingEntry}>delete</GeneralButton>
        </div>
        <div class="mainArea">
          <table class="mappingEntriesTable">
            <thead>
              <tr>
                <td>index</td>
                <td>channel</td>
                <td>src key</td>
                <td>src mods</td>
                <td>dst key</td>
                <td>dst mods</td>
              </tr>
            </thead>
            <tbody>
              {mappingEntries.map((item, index) => (
                <tr key={item.itemId}>
                  <td>{index}</td>
                  <td>
                    <GeneralSelectorN
                      options={getRoutingChannelOptions()}
                      value={item.channelIndex}
                      setValue={itemValueSetter(index, 'channelIndex')}
                    />
                  </td>
                  <td>
                    <GeneralSelector
                      value={item.srcKey}
                      setValue={itemValueSetter(index, 'srcKey')}
                      options={getRoutingTargetKeyOptions('source')}
                    />
                  </td>
                  <td>
                    <GeneralSelectorN
                      value={item.srcModifiers}
                      setValue={itemValueSetter(index, 'srcModifiers')}
                      options={getRoutingTargetModifierOptions('source')}
                    />
                  </td>
                  <td>
                    <GeneralSelector
                      value={item.dstKey}
                      setValue={itemValueSetter(index, 'dstKey')}
                      options={getRoutingTargetKeyOptions('dest')}
                    />
                  </td>
                  <td>
                    <GeneralSelectorN
                      value={item.dstModifiers}
                      setValue={itemValueSetter(index, 'dstModifiers')}
                      options={getRoutingTargetModifierOptions('dest')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const style = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  > .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  > .panel {
    position: absolute;
    width: 100%;
    max-width: 700px;
    height: calc(100% - 40px);
    max-height: 700px;
    padding: 15px 20px;
    border: solid 1px ${colors.clPrimary};
    background: ${colors.clPanelBox};
    display: flex;
    flex-direction: column;

    > .closeButton {
      position: absolute;
      right: 0;
      top: 0;
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 5px;
      cursor: pointer;
      font-size: 18px;
    }

    > .topArea {
      flex-shrink: 0;
      display: flex;
      gap: 20px;
      align-items: center;
    }

    > .mainArea {
      margin-top: 10px;
      flex-grow: 1;
      overflow-y: scroll;
      border: solid 1px #888;
      padding: 10px;

      > .mappingEntriesTable {
        flex-grow: 1;
        overflow-y: scroll;

        border-collapse: collapse;
        td {
          border: solid 1px #888;
          padding: 4px 10px;
        }
      }
    }
  }
`;
