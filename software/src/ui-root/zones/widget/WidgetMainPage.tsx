import { css } from 'goober';
import { h } from 'qx';
import { WidgetSvgKeyboardView } from '~/ui-root/zones/common/parts/keyboardSvg/panels/WidgetSvgKeyboardView';
import { makeWidgetMainPageViewModel } from '~/ui-root/zones/widget/WidgetMainPageViewModel';

const styles = {
  cssPanel: (contentScale: number) => css`
    width: 600px;
    height: 240px;
    user-select: none;
    transform: scale(${contentScale}, ${contentScale});
    position: relative;
    -webkit-app-region: drag;
  `,

  cssConfigButton: css`
    position: absolute;
    right: 18px;
    top: 17px;
    -webkit-app-region: no-drag;
    color: #fff;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #0cf;
    }
  `,
};

export function MainPanel() {
  const vm = makeWidgetMainPageViewModel();
  const contentScale = window.innerWidth / 600;
  return (
    <div css={styles.cssPanel(contentScale)}>
      <div css={styles.cssConfigButton} onClick={vm.onOpenButton}>
        <i className="fa fa-cog" />
      </div>
      <WidgetSvgKeyboardView vm={vm.keyboardVM} />
    </div>
  );
}
