import { css, FC, jsx, useEffect, useRef } from 'alumina';
import { fileExtensions } from '~/shared';
import { Icon } from '~/ui/components';
import { projectKeyboardListCardCommonStyles } from '~/ui/fabrics/projectKeyboardList/ProjectKeyboardList.CardCommonStyles';

type Props = {
  onClick: () => void;
  onFileDrop: (fileHandle: FileSystemFileHandle) => void;
};

export const ProjectKeyboardListProjectAddCard: FC<Props> = ({
  onClick,
  onFileDrop,
}) => {
  const refBaseDiv = useRef<HTMLElement>();

  useEffect(() => {
    const baseDiv = refBaseDiv.current!;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      baseDiv.classList.add('--drop-hover');
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      baseDiv.classList.remove('--drop-hover');
    };

    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      const item = e.dataTransfer?.items[0];
      if (
        item &&
        item.kind === 'file'
        // 拡張子がjsonでない場合以下の判定にマッチしない
        // item.type.startsWith('application/json')
      ) {
        const fileHandle =
          (await item.getAsFileSystemHandle()) as FileSystemFileHandle;
        if (fileHandle) {
          onFileDrop(fileHandle);
        }
      }
      baseDiv.classList.remove('--drop-hover');
    };

    baseDiv.addEventListener('dragover', onDragOver);
    baseDiv.addEventListener('dragleave', onDragLeave);
    baseDiv.addEventListener('drop', onDrop);

    return () => {
      baseDiv.removeEventListener('dragover', onDragOver);
      baseDiv.removeEventListener('dragleave', onDragLeave);
      baseDiv.removeEventListener('drop', onDrop);
    };
  }, []);

  return (
    <div class={style} onClick={onClick} ref={refBaseDiv}>
      <div class="inner">
        <div class="frame">
          <Icon spec="add" size={32} />
          <div class="texts">
            Add keyboard definition
            <br />
            (*{fileExtensions.package})
          </div>
        </div>
      </div>
    </div>
  );
};

const style = css`
  ${projectKeyboardListCardCommonStyles.base};
  cursor: pointer;

  > .inner {
    ${projectKeyboardListCardCommonStyles.inner};
    padding: 6px;

    > .frame {
      height: 100%;
      border: dashed 3px #ccc;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      color: #888;

      > .texts {
        margin-top: 5px;
        line-height: 1.5;
        text-align: center;
      }

      > .button {
        margin-top: 10px;
      }
    }
  }

  &:hover {
    > .inner {
      background: #f6fcff;
    }
  }

  &.--drop-hover > .inner > .frame {
    color: #0af;
    border: dashed 3px #0af;
  }
`;
