import { css, FC, jsx } from 'qx';
import { LayoutPreviewShapeView } from '~/ui/fabrics/LayoutPreviewShapeView/LayoutPreviewShapeView';
import { useLayoutConfigurationSectionModel } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/model';
import { LayoutGeneratorOptionsPart } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutGeneratorOptionsPart/view';

export const LayoutConfigurationSection: FC<{ configurable: boolean }> = ({
  configurable,
}) => {
  const { design, labelEntities, holdKeyIndices } =
    useLayoutConfigurationSectionModel();
  const style = css`
    > .shape-view {
      height: 200px;
    }

    > .options-part {
      margin-top: 10px;
    }
  `;
  return (
    <div class={style}>
      <LayoutPreviewShapeView
        keyboardDesign={design}
        labelEntities={labelEntities}
        holdKeyIndices={holdKeyIndices}
        class="shape-view"
        showLabels={configurable}
      />
      <LayoutGeneratorOptionsPart class="options-part" qxIf={configurable} />
    </div>
  );
};

export const LayoutConfigurationSectionRawContent: FC = () => {
  const { design, labelEntities, holdKeyIndices } =
    useLayoutConfigurationSectionModel();
  return (
    <LayoutPreviewShapeView
      keyboardDesign={design}
      labelEntities={labelEntities}
      holdKeyIndices={holdKeyIndices}
      showLabels={true}
    />
  );
};
