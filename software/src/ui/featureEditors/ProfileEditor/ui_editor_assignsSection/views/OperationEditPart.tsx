import { jsx, css, FC } from 'alumina';
import { OperationCard, OperationLayerOptionSelector } from '~/ui/elements';
import {
  IPlainOperationEditCardsViewModel,
  IOperationEditPartViewModel,
} from '~/ui/featureEditors/ProfileEditor/ui_editor_assignsSection/viewModels/OperationEditPartViewModel';
import { IOperationLayerOptionEditViewModel } from '~/ui/featureEditors/ProfileEditor/ui_editor_assignsSection/viewModels/OperationLayerOptionEditViewModel';

type Props = {
  plainOperationEditCardsVM: IPlainOperationEditCardsViewModel;
  operationEditPartVM: IOperationEditPartViewModel;
  layoutOptionEditVM: IOperationLayerOptionEditViewModel;
  isSingleMode: boolean;
};

export const OperationEditPart: FC<Props> = ({
  plainOperationEditCardsVM: { noAssignEntry, transparentEntry, blockEntry },
  operationEditPartVM: {
    virtualKeyEntryGroups,
    attachedModifierEntries,
    layerCallEntries,
    systemActionEntries,
    virtualKeyEntryGroups2,
  },
  layoutOptionEditVM,
  isSingleMode,
}) => (
  <div css={cssAssignPanel}>
    <div css={cssGroupBoxV}>
      <OperationCard model={noAssignEntry} />
      {isSingleMode && <OperationCard model={blockEntry} />}
      {isSingleMode && <OperationCard model={transparentEntry} />}
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
          <OperationLayerOptionSelector {...layoutOptionEditVM} />
        </div>
      </div>
      <div css={cssLayerAssignsRow}>
        <div css={cssGroupBox}>
          {systemActionEntries.map((model) => (
            <OperationCard model={model} key={model.sig} />
          ))}
        </div>
      </div>
      <div css={cssKeyAssignsRow}>
        <div>
          {virtualKeyEntryGroups2.map((group, index) => (
            <div css={cssGroupBox} key={index}>
              {group.map((model) => (
                <OperationCard model={model} key={model.sig} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

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
