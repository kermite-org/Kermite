import { css } from 'goober';
import { h, Hook, asyncRerender } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/ui-common/modules/DisplayKeyboardDesignLoader';
import { loadLocalStorageKeyboardDesignOrDefault } from '~/ui-mock-view/LocalStoragePersistKeyboardDesign';

const state = new (class {
  design: IDisplayKeyboardDesign | undefined;
})();

const cssRootDiv = css`
  height: 100%;
  overflow: scroll;
`;

export const MockPageLoadedDesignDrawing = () => {
  Hook.useEffect(() => {
    const persistDesign = loadLocalStorageKeyboardDesignOrDefault();
    const design = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
      persistDesign,
    );
    console.log({ design });
    state.design = design;
    asyncRerender();
  }, []);

  return (
    <div css={cssRootDiv}>
      <pre>{JSON.stringify(state.design, null, ' ')}</pre>
    </div>
  );
};
