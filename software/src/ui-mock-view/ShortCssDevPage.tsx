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
      <div xw="m[10px] p-20px col(red) border-d1-blue">aaa</div>
      <div xw="bg(#FEE) mt-20px p-10px mb-10px">bbb</div>
      <div xw="flex border-s1-blue p-8px gap-8px">
        <div xw="border-s1-red w-40px h-40px" />
        <div xw="border-s1-red w-40px h-40px" />
        <div xw="border-s1-red w-40px h-40px" />
      </div>
      <div xw="w-80px h-80px centerFlex border-s1-green">aaa</div>
    </div>
  );
};
