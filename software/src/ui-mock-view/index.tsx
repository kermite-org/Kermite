/* eslint-disable @typescript-eslint/no-unused-vars */
import { jsx, render, rerender } from 'alumina';
import { debounce } from '~/shared';
import { AluminaDebugPage } from '~/ui-mock-view/AluminaDebugPage';
import { AluminaDebugPage2 } from '~/ui-mock-view/AluminaDebugPage2';
import { AluminaDebugPage3 } from '~/ui-mock-view/AluminaDebugPage3';
import { AluminaDebugPage4 } from '~/ui-mock-view/AluminaDebugPage4';
import { AluminaDebugPage5 } from '~/ui-mock-view/AluminaDebugPage5';
import { initializeCss } from '~/ui-mock-view/CssInitializer';
import { GooberDevelopmentPage } from '~/ui-mock-view/GooberDevelopmentPage';
import { GooberDevelopmentPage2 } from '~/ui-mock-view/GooberDevelopmentPage2';
import { HoverHintDevelopmentPage } from '~/ui-mock-view/HoverHintDevelopmentPage';
import { MockPageComponentDevelopment } from '~/ui-mock-view/MockPageComponentDevelopment';
import { MockPageLoadedDesignDrawing } from '~/ui-mock-view/MockPageLoadedDesignDrawing';
import { RoutingDevelopmentPage } from '~/ui-mock-view/RoutingDevelopmentPage';
import { ShortCssDevPage } from '~/ui-mock-view/ShortCssDevPage';
import { SpaLayoutDebugPage } from '~/ui-mock-view/SpaLayoutDebugPage';
import { SvgScalingDevPage } from '~/ui-mock-view/SvgScalingDev';
import { LayoutManagerPageComponent } from '~/ui/pages/LayoutEditorPage';
import { MockPageLayoutEditorDevelopment } from './MockPageLayouterDevelopment';

const PageRoot = () => {
  return (
    <div style={{ height: '100%' }}>
      {/* <AluminaDebugPage /> */}
      {/* <AluminaDebugPage2 /> */}
      {/* <AluminaDebugPage3 /> */}
      {/* <AluminaDebugPage4 /> */}
      {/* <AluminaDebugPage5 /> */}
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
      <SpaLayoutDebugPage />
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
