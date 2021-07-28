import { css, jsx } from 'qx';
import { generateNextSequentialId } from '~/shared/funcs/DomainRelatedHelpers';
import {
  FcWithClassName,
  fieldSetter,
  GeneralButton,
  GeneralSelector,
  uiTheme,
} from '~/ui/common';
import { GeneralSelectorN } from '~/ui/common/components/atoms/GeneralSelectorN';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { editorPageModel } from '~/ui/pages/editor-page/models/editorPageModel';
import {
  getRoutingChannelOptions,
  getRoutingTargetKeyOptions,
  getRoutingTargetModifierOptions,
} from '~/ui/pages/editor-page/ui_modal_routingPanel/ActionRoutingPanelModel';

const style = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  > .panel {
    position: absolute;
    width: 100%;
    max-width: 700px;
    height: calc(100% - 40px);
    max-height: 700px;
    padding: 15px 20px;
    border: solid 1px ${uiTheme.colors.clPrimary};
    background: ${uiTheme.colors.clPanelBox};
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

export const ActionRoutingPanel: FcWithClassName = ({ className }) => {
  const { mappingEntries } = editorModel.profileData;

  const addMappingEntry = () => {
    const newId = generateNextSequentialId(
      're-',
      mappingEntries.map((it) => it.itemId),
    );
    mappingEntries.push({
      itemId: newId,
      channelIndex: 0,
      srcKey: 'K_NONE',
      srcModifiers: 0,
      dstKey: 'K_NONE',
      dstModifiers: 0,
    });
  };

  const deleteLastMappingEntry = () => {
    if (mappingEntries.length > 0) {
      mappingEntries.pop();
    }
  };

  const handleClose = () => {
    editorPageModel.routingPanelVisible = false;
  };

  return (
    <div css={style} class={className}>
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
                      setValue={fieldSetter(item, 'channelIndex')}
                    />
                  </td>
                  <td>
                    <GeneralSelector
                      value={item.srcKey}
                      setValue={fieldSetter(item, 'srcKey') as any}
                      options={getRoutingTargetKeyOptions('source')}
                    />
                  </td>
                  <td>
                    <GeneralSelectorN
                      value={item.srcModifiers}
                      setValue={fieldSetter(item, 'srcModifiers')}
                      options={getRoutingTargetModifierOptions('source')}
                    />
                  </td>
                  <td>
                    <GeneralSelector
                      value={item.dstKey}
                      setValue={fieldSetter(item, 'dstKey') as any}
                      options={getRoutingTargetKeyOptions('dest')}
                    />
                  </td>
                  <td>
                    <GeneralSelectorN
                      value={item.dstModifiers}
                      setValue={fieldSetter(item, 'dstModifiers')}
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
