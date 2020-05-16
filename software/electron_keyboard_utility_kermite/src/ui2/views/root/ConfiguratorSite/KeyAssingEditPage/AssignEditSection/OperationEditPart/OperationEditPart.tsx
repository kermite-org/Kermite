import { h } from '~ui2/views/basis/qx';
import { css } from 'goober';
import { UiTheme } from '~ui2/views/common/UiTheme';
import {
  makeOperationEditPartViewModel,
  IOperationCardViewModel
} from './OperationEditPart.model';

const OperationCard = (props: { model: IOperationCardViewModel }) => {
  const { text, isCurrent, setCurrent, isEnabled } = props.model;

  const isTextLong = text.length >= 2;

  const cssCard = css`
    min-width: 28px;
    height: 28px;
    background: #383838;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 2px;
    cursor: pointer;
    font-size: ${isTextLong ? '12px' : '15px'};

    &[data-current] {
      background: ${UiTheme.clSelectHighlight};
    }

    &[data-disabled] {
      opacity: 0.3;
      cursor: default;
      pointer-events: none;
    }
  `;

  return (
    <div
      css={cssCard}
      data-current={isCurrent}
      onMouseDown={setCurrent}
      data-disabled={!isEnabled}
    >
      {text}
    </div>
  );
};

export function OpertionEditPart() {
  const {
    noAssignEntry,
    virtualKeyEntryGroups,
    attachedModifierEntries,
    layerCallEntries
  } = makeOperationEditPartViewModel();

  const cssAssignPanel = css`
    display: flex;
  `;

  const cssGroupBox = css`
    display: flex;
    flex-wrap: wrap;
    width: 580px;
    > * {
      margin: 2px;
    }
  `;

  const cssGroupBoxV = css`
    margin: 2px 6px;
    > * + * {
      margin-top: 4px;
    }
  `;

  const cssKeyAssignsRow = css`
    display: flex;
  `;

  const cssLayerAssignsRow = css`
    margin-top: 8px;
  `;

  return (
    <div css={cssAssignPanel}>
      <div css={cssGroupBoxV}>
        <OperationCard model={noAssignEntry} />
      </div>
      <div>
        <div css={cssKeyAssignsRow}>
          <div>
            {virtualKeyEntryGroups.map((group, index) => (
              <div css={cssGroupBox} key={index}>
                {group.map((model) => (
                  <OperationCard model={model} key={model.sig} />
                ))}
              </div>
            ))}
          </div>
          <div>
            <div css={cssGroupBoxV}>
              {attachedModifierEntries.map((model) => (
                <OperationCard model={model} key={model.sig} />
              ))}
            </div>
          </div>
        </div>
        <div css={cssLayerAssignsRow}>
          <div css={cssGroupBox}>
            {layerCallEntries.map((model) => (
              <OperationCard model={model} key={model.sig} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
