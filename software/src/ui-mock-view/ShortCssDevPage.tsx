import { jsx, setShortCssProcessor, css } from 'qx';
import { shortCssProcessor } from '~/ui-common/base';

const cssRoot = css`
  border: solid 3px orange;
  padding: 10px;
`;

setShortCssProcessor(shortCssProcessor);

export const ShortCssDevPage = () => {
  console.log('render');
  return (
    <div css={cssRoot}>
      <div xw="margin(10px) padding(20px) color(red) border(solid 1px red)">
        aaa
      </div>
      <div xw="background(#FEE) marginTop(20px) padding(10px) marginBottom(10px)">
        bbb
      </div>
      <div xw="display(flex) border(solid 1px blue) padding(8px) gap(8px)">
        <div xw="border(solid 1px red) width(40px) height(40px)" />
        <div xw="border(solid 1px red) width(40px) height(40px)" />
        <div xw="border(solid 1px red) width(40px) height(40px)" />
      </div>
      <div xw="width(80px) height(80px) $centerFlex border(solid 1px green)">
        aaa
      </div>
    </div>
  );
};
