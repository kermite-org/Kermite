import { css, FC, jsx, useRef } from 'alumina';
import { WidgetSvgKeyboardView } from '../elements';
import { useWidgetMainPanelModel } from './widgetPage/models/widgetMainPanelModel';

export const EditorDemoPage: FC = () => {
  const vm = useWidgetMainPanelModel();

  const textAreaRef = useRef<HTMLTextAreaElement>();

  const handleClearText = () => {
    const textArea = textAreaRef.current!;
    textArea.value = '';
  };
  return (
    <div class={style}>
      <div class="editor-row">
        <textarea placeholder="テスト入力欄" ref={textAreaRef} />
        <div class="btn-delete" onClick={handleClearText}>
          消去
        </div>
      </div>
      <div class="keyboard-row">
        <WidgetSvgKeyboardView
          keyboardDesign={vm.keyboardVM.keyboardDesign}
          cards={vm.keyboardVM.cards}
        />
      </div>
    </div>
  );
};

const style = css`
  width: 100%;
  height: 100%;

  > .editor-row {
    height: 30%;
    padding: 6px;
    position: relative;
    > textarea {
      width: 100%;
      height: 100%;
      resize: none;
      font-size: 40px;
      padding: 5px 10px;

      &::placeholder {
        color: #aaa;
      }
    }

    > .btn-delete {
      position: absolute;
      top: 0;
      right: 0;
      margin-top: 12px;
      margin-right: 22px;
      font-size: 20px;
      cursor: pointer;
      color: #888;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  > .keyboard-row {
    height: 70%;
  }
`;
