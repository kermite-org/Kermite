/* eslint-disable @typescript-eslint/no-unused-vars */
import { jsx, render, rerender } from 'qx';
import { debounce } from '~/shared';
import { ComponentCatalogPage } from '~/ui-mock-view/ComponentCatalog';
import { initializeCss } from '~/ui-mock-view/CssInitializer';
import { GooberDevelopmentPage } from '~/ui-mock-view/GooberDevelopmentPage';
import { GooberDevelopmentPage2 } from '~/ui-mock-view/GooberDevelopmentPage2';
import { HoverHintDevelopmentPage } from '~/ui-mock-view/HoverHintDevelopmentPage';
import { MockPageComponentDevelopment } from '~/ui-mock-view/MockPageComponentDevelopment';
import { MockPageLoadedDesignDrawing } from '~/ui-mock-view/MockPageLoadedDesignDrawing';
import { QxDebugPage } from '~/ui-mock-view/QxDebugPage';
import { QxDebugPage2 } from '~/ui-mock-view/QxDebugPage2';
import { QxDebugPage3 } from '~/ui-mock-view/QxDebugPage3';
import { QxDebugPage4 } from '~/ui-mock-view/QxDebugPage4';
import { QxDebugPage5 } from '~/ui-mock-view/QxDebugPage5';
import { RoutingDevelopmentPage } from '~/ui-mock-view/RoutingDevelopmentPage';
import { ShortCssDevPage } from '~/ui-mock-view/ShortCssDevPage';
import { SpaLayoutDebugPage } from '~/ui-mock-view/SpaLayoutDebugPage';
import { SvgScalingDevPage } from '~/ui-mock-view/SvgScalingDev';
import { LayoutManagerPageComponent } from '~/ui/pages/layout-editor-page';
import { MockPageLayoutEditorDevelopment } from './MockPageLayouterDevelopment';

const PageRoot = () => {
  return (
    <div style={{ height: '100%' }}>
      {/* <QxDebugPage /> */}
      {/* <QxDebugPage2 /> */}
      {/* <QxDebugPage3 /> */}
      <QxDebugPage4 />
      {/* <QxDebugPage5 /> */}
      {/* <MockPageLayouterDevelopment /> */}
      {/* <MockPageLoadedDesignDrawing /> */}
      {/* <UiLayouterPageComponent /> */}

      {/* <RoutingDevelopmentPage /> */}
      {/* <MockPageComponentDevelopment /> */}
      {/* <HoverHintDevelopmentPage /> */}

      {/* <GooberDevelopmentPage /> */}
      {/* <GooberDevelopmentPage2 /> */}
      {/* <ShortCssDevPage /> */}
      {/* <ComponentCatalogPage /> */}
      {/* <SvgScalingDevPage /> */}
      {/* <SpaLayoutDebugPage /> */}
    </div>
  );
};

window.addEventListener('load', () => {
  const appDiv = document.getElementById('app');
  initializeCss();
  render(() => <PageRoot />, appDiv);

  window.addEventListener('resize', debounce(rerender, 300));
  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
  });
});
