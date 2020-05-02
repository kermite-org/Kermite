import { hx } from '~ui2/views/basis/qx';
import { css } from 'goober';
import { UiTheme } from '~ui2/views/common/UiTheme';
import {
  makeOperationEditPartViewModel,
  IOperationCardViewModel
} from './OperationEditPart.model';

const OperationCard = (props: { model: IOperationCardViewModel }) => {
  const { text, isCurrent, setCurrent, isEnabled } = props.model;

  const cssCard = css`
    min-width: 20px;
    height: 20px;
    background: #383838;
    margin: 1.5px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 4px;
    cursor: pointer;

    &[data-current] {
      background: ${UiTheme.clSelectHighlight};
    }

    &[data-disabled] {
      opacity: 0.5;
      cursor: default;
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

  const cssGroupsOuter = css`
    flex-grow: 1;
    overflow-y: scroll;
    border: solid 4px red;
    height: 100px;
    padding: 4px;
  `;
  const cssGroupBox = css`
    display: flex;
    flex-wrap: wrap;
  `;

  return (
    <div css={cssGroupsOuter}>
      <div css={cssGroupBox}>
        <OperationCard model={noAssignEntry} />
      </div>
      <div>keys</div>
      {virtualKeyEntryGroups.map((group, index) => (
        <div css={cssGroupBox} key={index}>
          {group.map((model) => (
            <OperationCard model={model} key={model.sig} />
          ))}
        </div>
      ))}
      <div>modifiers</div>
      <div css={cssGroupBox}>
        {attachedModifierEntries.map((model) => (
          <OperationCard model={model} key={model.sig} />
        ))}
      </div>
      <div>layers</div>
      <div css={cssGroupBox}>
        {layerCallEntries.map((model) => (
          <OperationCard model={model} key={model.sig} />
        ))}
      </div>
    </div>
  );
}
