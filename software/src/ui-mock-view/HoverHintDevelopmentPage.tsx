import { jsx, css } from 'alumina';

const globalHintMouseMoveHandler = (e: MouseEvent) => {
  const el = e.target as HTMLElement;
  const instArea = document.getElementById('domHintDisplayText');
  if (!(el && instArea)) {
    return;
  }
  instArea.innerText = el.dataset.hint || '';
};

const GlobalHintDisplayText = () => <span id="domHintDisplayText" />;

const cssInstructionArea = css`
  border: solid 3px #0af8;
  height: 32px;
`;

export const HoverHintDevelopmentPage = () => {
  return (
    <div onMouseMove={globalHintMouseMoveHandler}>
      <div css={cssInstructionArea}>
        <GlobalHintDisplayText />
      </div>
      <div data-hint="hoge">foo</div>
      <div data-hint="piyo">
        bar
        <div data-hint="poyo">zoo</div>
      </div>
      <div>buzz</div>
    </div>
  );
};
