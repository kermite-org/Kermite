import { jsx, setShortCssProcessor, css } from 'alumina';
import { shortCssProcessor } from '~/ui/base';

const cssRoot = css`
  border: solid 3px orange;
  padding: 10px;
`;

setShortCssProcessor(shortCssProcessor);

export const ShortCssDevPage = () => {
  console.log('render');
  return (
    <div css={cssRoot}>
      <div xs="margin[10px] padding[20px] color[red] border[solid 1px red]">
        aaa
      </div>
      <div xs="background[#FEE] marginTop[20px] padding[10px] marginBottom[10px]">
        bbb
      </div>
      <div xs="display[flex] border[solid 1px blue] padding[8px] gap[8px]">
        <div xs="border[solid 1px red] width[40px] height[40px]" />
        <div xs="border[solid 1px red] width[40px] height[40px]" />
        <div xs="border[solid 1px red] width[40px] height[40px]" />
      </div>
      <div xs="width[80px] height[80px] $centerFlex border[solid 1px green]">
        aaa
      </div>
      <div xs="width:80px; height:80px; $centerFlex; border:solid 1px #F80;">
        aaa
      </div>
    </div>
  );
};
