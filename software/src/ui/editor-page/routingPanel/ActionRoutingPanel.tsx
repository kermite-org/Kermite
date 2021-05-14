import { css, jsx } from 'qx';
import { generateNextSequentialId } from '~/shared/funcs/DomainRelatedHelpers';
import {
  FcWithClassName,
  fieldSetter,
  GeneralButton,
  uiTheme,
} from '~/ui/common';
import { editorModel } from '~/ui/editor-page/editorMainPart/models/EditorModel';
import { RoutingTargetChannelSelector } from '~/ui/editor-page/routingPanel/Selectors/RoutingTargetChannelSelector';
import { RoutingTargetKeySelector } from '~/ui/editor-page/routingPanel/Selectors/RoutingTargetKeySelector';
import { RoutingTargetModifierSelector } from '~/ui/editor-page/routingPanel/Selectors/RoutingTargetModifierSelector';

const style = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  > .panel {
    width: 100%;
    max-width: 700px;
    height: 100%;
    max-height: 700px;
    padding: 15px 20px;
    border: solid 1px ${uiTheme.colors.clPrimary};
    background: ${uiTheme.colors.clPanelBox};
    display: flex;
    flex-direction: column;

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

  return (
    <div css={style} class={className}>
      <div class="panel">
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
                    <RoutingTargetChannelSelector
                      value={item.channelIndex}
                      onChange={fieldSetter(item, 'channelIndex')}
                    />
                  </td>
                  <td>
                    <RoutingTargetKeySelector
                      value={item.srcKey}
                      onChange={fieldSetter(item, 'srcKey') as any}
                      target="source"
                    />
                  </td>
                  <td>
                    <RoutingTargetModifierSelector
                      value={item.srcModifiers}
                      onChange={fieldSetter(item, 'srcModifiers')}
                      target="source"
                    />
                  </td>
                  <td>
                    <RoutingTargetKeySelector
                      value={item.dstKey}
                      onChange={fieldSetter(item, 'dstKey') as any}
                      target="dest"
                    />
                  </td>
                  <td>
                    <RoutingTargetModifierSelector
                      value={item.dstModifiers}
                      onChange={fieldSetter(item, 'dstModifiers')}
                      target="dest"
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
