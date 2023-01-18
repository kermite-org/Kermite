import { css, FC, jsx } from 'alumina';
import { colors, texts } from '~/ui/base';
import { LayoutTemplateAttributesEditSection } from '~/ui/fabrics/LayoutTemplateAttributesEditSection';
import { LayoutConfigurationSectionContentEx } from '~/ui/fabrics/layoutConfigurationSectionEx/view';
import { LayoutGeneratorOptionsPartEx } from '~/ui/fabrics/layoutGeneratorOptionsPartEx/view';
import { exfProjectSetupStore } from '~/ui/features/externalFirmwareProjectSetupWizard/store/exfProjectSetupStore';

export const ExfProjectSetupPart_StepLayoutConfig: FC = () => {
  const { layoutTemplateAttrs, layoutOptions } = exfProjectSetupStore.state;
  const { writeLayoutOption, writeTemplateAttrs } =
    exfProjectSetupStore.actions;
  return (
    <div class={style}>
      <h1>{texts.layoutGeneratorConfiguration.headerLayoutConfiguration}</h1>
      <LayoutTemplateAttributesEditSection
        templateAttrs={layoutTemplateAttrs}
        writeTemplateAttrs={writeTemplateAttrs}
        class="template-attrs-part"
      />
      <LayoutConfigurationSectionContentEx
        class="layout-view"
        templateAttrs={layoutTemplateAttrs}
        layoutOptions={layoutOptions}
        showLabels={true}
      />
      <LayoutGeneratorOptionsPartEx
        class="options-part"
        layoutOptions={layoutOptions}
        writeLayoutOption={writeLayoutOption}
      />
    </div>
  );
};

const style = css`
  height: 100%;
  background: ${colors.clPanelBox};
  padding: 20px;

  > .template-attrs-part {
    margin-top: 10px;
  }

  > .layout-view {
    margin-top: 10px;
    height: 300px;
  }

  > .options-part {
    margin-top: 20px;
  }
`;
