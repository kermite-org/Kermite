import { css } from 'goober';
import { h } from '~lib/qx';
import { LayerOptionEdit } from './LayerOptionEdit';
import { OperationCard } from './OperationCard';
import { makeOperationEditPartViewModel } from './OperationEditPart.model';

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
                  <OperationCard
                    model={model}
                    key={model.sig}
                    qxOptimizer="deepEqualExFn"
                  />
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
              <OperationCard
                model={model}
                key={model.sig}
                qxOptimizer="deepEqualExFn"
              />
            ))}
            <LayerOptionEdit />
          </div>
        </div>
      </div>
    </div>
  );
}
