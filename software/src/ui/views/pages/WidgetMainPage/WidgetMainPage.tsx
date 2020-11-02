import { css } from 'goober';
import { h } from '~lib/qx';
import { WidgetMainPageViewModel } from '~ui/viewModels/WidgetMainPageViewModel';
import { SvgKeyboardView } from './WidgetKeyboardView/SvgKeyboardView';

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
  `
};

export function MainPanel({ vm }: { vm: WidgetMainPageViewModel }) {
  const contentScale = window.innerWidth / 600;

  return (
    <div css={styles.cssPanel(contentScale)}>
      <div css={styles.cssConfigButton} onClick={vm.onOpenButton}>
        <i className="fa fa-cog" />
      </div>
      <SvgKeyboardView vm={vm.keyboardVM} />
    </div>
  );
}
