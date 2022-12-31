import { FC, css, jsx } from 'alumina';
import { OperationCard, OperationLayerOptionSelector } from '~/fe-shared';
import {
  IOperationEditPartViewModel,
  IOperationLayerOptionEditViewModel,
  IPlainOperationEditCardsViewModel,
} from '../viewModels';

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
  <div class={cssAssignPanel}>
    <div class={cssGroupBoxV}>
      <OperationCard model={noAssignEntry} />
      {isSingleMode && <OperationCard model={blockEntry} />}
      {isSingleMode && <OperationCard model={transparentEntry} />}
    </div>
    <div>
      <div class={cssKeyAssignsRow}>
        <div>
          {virtualKeyEntryGroups.map((group, index) => (
            <div class={cssGroupBox} key={index}>
              {group.map((model) => (
                <OperationCard model={model} key={model.sig} />
              ))}
            </div>
          ))}
        </div>
        <div>
          <div class={cssGroupBoxV}>
            {attachedModifierEntries.map((model) => (
              <OperationCard model={model} key={model.sig} />
            ))}
          </div>
        </div>
      </div>
      <div class={cssLayerAssignsRow}>
        <div class={cssGroupBox}>
          {layerCallEntries.map((model) => (
            <OperationCard model={model} key={model.sig} />
          ))}
          <OperationLayerOptionSelector {...layoutOptionEditVM} />
        </div>
      </div>
      <div class={cssLayerAssignsRow}>
        <div class={cssGroupBox}>
          {systemActionEntries.map((model) => (
            <OperationCard model={model} key={model.sig} />
          ))}
        </div>
      </div>
      <div class={cssKeyAssignsRow}>
        <div>
          {virtualKeyEntryGroups2.map((group, index) => (
            <div class={cssGroupBox} key={index}>
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
