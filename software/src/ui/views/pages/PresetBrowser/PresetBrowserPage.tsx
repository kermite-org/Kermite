import { css } from 'goober';
import { h } from '~lib/qx';
import { ComponentCatalog } from '~ui/views/organisms/ComponentCatalog';

const cssBase = css`
  background: #fff;
  height: 100%;
`;
export const PresetBrowserPage = () => {
  return (
    <div css={cssBase}>
      <div>preset browser</div>
      <ComponentCatalog />
    </div>
  );
};
