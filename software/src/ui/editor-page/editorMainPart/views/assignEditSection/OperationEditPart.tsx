import { jsx, css } from 'qx';
import { OperationCard } from '~/ui/editor-page/components/elements/OperationCard';
import { OperationLayerOptionSelector } from '~/ui/editor-page/components/fabrics/OperationLayerOptionSelector';
import {
  IPlainOperationEditCardsViewModel,
  IOperationEditPartViewModel,
} from '~/ui/editor-page/editorMainPart/viewModels/OperationEditPartViewModel';
import { IOperationLayerOptionEditViewModel } from '~/ui/editor-page/editorMainPart/viewModels/OperationLayerOptionEditViewModel';

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

export function OpertionEditPart(props: {
  plainOperationEditCardsVM: IPlainOperationEditCardsViewModel;
  operationEditPartVM: IOperationEditPartViewModel;
  layoutOptionEditVM: IOperationLayerOptionEditViewModel;
  isSingleMode: boolean;
}) {
  const {
    noAssignEntry,
    transparentEntry,
    blockEntry,
  } = props.plainOperationEditCardsVM;

  const {
    virtualKeyEntryGroups,
    attachedModifierEntries,
    layerCallEntries,
    systemActionEntries,
  } = props.operationEditPartVM;

  return (
    <div css={cssAssignPanel}>
      <div css={cssGroupBoxV}>
        <OperationCard model={noAssignEntry} />
        {props.isSingleMode && <OperationCard model={blockEntry} />}
        {props.isSingleMode && <OperationCard model={transparentEntry} />}
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
            <OperationLayerOptionSelector {...props.layoutOptionEditVM} />
          </div>
        </div>
        <div css={cssLayerAssignsRow}>
          <div css={cssGroupBox}>
            {systemActionEntries.map((model) => (
              <OperationCard model={model} key={model.sig} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
