import { css } from 'goober';
import { h } from '~lib/qx';
import { ComponentCatalog } from '~ui/views/organisms/ComponentCatalog';
import { PresetKeyboardSection } from '../organisms/PresetKeyboardSection';

const cssBase = css`
  background: #fff;
  height: 100%;
  padding: 20px;
  > * + * {
    margin-top: 10px;
  }
`;
export const PresetBrowserPage = () => {
  return (
    <div css={cssBase}>
      <div>preset browser</div>
      <ComponentCatalog />
      <PresetKeyboardSection />
    </div>
  );
};
