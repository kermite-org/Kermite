import { css, FC, jsx, useEffect, useRef } from 'alumina';
import { fileExtensions, IFileReadHandle } from '~/shared';
import { appUi } from '~/ui/base';
import { Icon, modalError } from '~/ui/components';
import { projectKeyboardListCardCommonStyles } from '~/ui/fabrics/projectKeyboardList/ProjectKeyboardList.CardCommonStyles';

type Props = {
  onClick: () => void;
  onFileDrop: (fileHandle: IFileReadHandle) => void;
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
      baseDiv.classList.remove('--drop-hover');
      const file = e.dataTransfer?.files[0];
      if (file) {
        appUi.rerender();
        const fileName = file.name;
        if (!fileName.endsWith(fileExtensions.package)) {
          await modalError(
            `Invalid file. Only ${fileExtensions.package} file can be loaded.`,
          );
          return;
        }
        const contentText = await file.text();
        onFileDrop({ fileName, contentText });
      }
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
