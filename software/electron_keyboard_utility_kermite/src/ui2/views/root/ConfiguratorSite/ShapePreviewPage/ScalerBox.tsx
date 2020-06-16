import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { appUi } from '~ui2/models/appGlobal';
import { Component } from '~ui2/views/basis/qx/qxinternal_petit_dom/Component';

const cssBase = css`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* border: solid 2px #f0f; */
`;

const cssInner = css`
  /* border: solid 2px blue; */
`;

interface IScalerBoxProps {
  contentWidth: number;
  contentHeight: number;
  children: any;
}

/*
export class ScalerBoxC extends Component<IScalerBoxProps, {}> {
  private domBaseElementId = `scalerBox-${(Math.random() * 10000) >> 0}`;

  private scale = 1.0;

  render() {
    const { contentWidth, contentHeight, children } = this.props;
    const { domBaseElementId } = this;

    const baseEl = document.getElementById(domBaseElementId);
    if (!baseEl) {
      setTimeout(appUi.rerender, 1);
    } else {
      const { clientWidth: bw, clientHeight: bh } = baseEl;
      this.scale = Math.min(bw / contentWidth, bh / contentHeight);
    }

    const sc = this.scale;

    return (
      <div css={cssBase} id={domBaseElementId}>
        <div
          css={cssInner}
          style={{
            width: `${contentWidth}px`,
            height: `${contentHeight}px`,
            transform: `scale(${sc}, ${sc})`
          }}
        >
          {children}
        </div>
      </div>
    );
  }
}
*/

export function ScalerBox(initalProps: IScalerBoxProps) {
  const domBaseElementId = `scalerBox-${(Math.random() * 10000) >> 0}`;
  let scale = 1.0;

  return (props: IScalerBoxProps) => {
    const { contentWidth, contentHeight, children } = props;

    const baseEl = document.getElementById(domBaseElementId);
    if (!baseEl) {
      setTimeout(appUi.rerender, 1);
    } else {
      const { clientWidth: bw, clientHeight: bh } = baseEl;
      scale = Math.min(bw / contentWidth, bh / contentHeight);
      console.log({ scale });
    }

    //todo: contentWidthがclientWidthより大きい場合に拡大率を1以下に下げる

    return (
      <div css={cssBase} id={domBaseElementId}>
        <div
          css={cssInner}
          style={{
            width: `${contentWidth}px`,
            height: `${contentHeight}px`,
            transform: `scale(${scale}, ${scale})`
          }}
        >
          {children}
        </div>
      </div>
    );
  };
}
