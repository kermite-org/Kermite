import { css } from 'goober';
import { h } from '~lib/qx';
import { appUi } from '~ui/core/appUi';

const cssBase = css`
  width: 100%;
  height: 100%;
  /* border: solid 2px #f0f; */
  position: relative;
`;

const cssInner = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto auto;
  transform-origin: left top;
  /* border: solid 2px blue; */
`;

interface IScalerBoxProps {
  contentWidth: number;
  contentHeight: number;
  children: any;
}

export function ScalerBox(_initialProps: IScalerBoxProps) {
  const domBaseElementId = `scalerBox-${(Math.random() * 10000) >> 0}`;
  let scale = 1.0;
  let mh = 0;
  let mv = 0;

  return (props: IScalerBoxProps) => {
    const { contentWidth, contentHeight, children } = props;

    const baseEl = document.getElementById(domBaseElementId);
    if (!baseEl) {
      setTimeout(appUi.rerender, 1);
    } else {
      const { clientWidth: bw, clientHeight: bh } = baseEl;
      scale = Math.min(bw / contentWidth, bh / contentHeight);
      mh = Math.max((bw - contentWidth * scale) / 2, 0);
      mv = Math.max((bh - contentHeight * scale) / 2, 0);
      // console.log({ scale });
    }

    return (
      <div css={cssBase} id={domBaseElementId}>
        <div
          css={cssInner}
          style={{
            width: `${contentWidth}px`,
            height: `${contentHeight}px`,
            transform: `scale(${scale}, ${scale})`,
            marginLeft: `${mh}px`,
            marginTop: `${mv}px`
          }}
        >
          {children}
        </div>
      </div>
    );
  };
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
