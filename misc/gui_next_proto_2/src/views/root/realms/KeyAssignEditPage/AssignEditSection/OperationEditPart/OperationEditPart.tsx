import { hx } from '~views/basis/qx';
import { css } from 'goober';
import { UiTheme } from '~views/common/UiTheme';
import {
  makeOperationEditPartViewModel,
  IOperationCardViewModel,
} from './OperationEditPart.model';

const OperationCard = (props: { model: IOperationCardViewModel }) => {
  const { text, isCurrent, setCurrent } = props.model;

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
  `;

  return (
    <div css={cssCard} data-current={isCurrent} onClick={setCurrent}>
      {text}
    </div>
  );
};

export function OpertionEditPart() {
  const { virtualKeyEntryGroups } = makeOperationEditPartViewModel();

  const cssGroupsOuter = css`
    flex-grow: 1;
    overflow-y: scroll;
    border: solid 4px red;
    height: 100px;
  `;
  const cssGroupBox = css`
    display: flex;
    flex-wrap: wrap;
  `;

  return (
    <div css={cssGroupsOuter}>
      {virtualKeyEntryGroups.map((group, index) => (
        <div css={cssGroupBox} key={index}>
          {group.map((model, index) => (
            <OperationCard model={model} key={index} />
          ))}
        </div>
      ))}
    </div>
  );
}
