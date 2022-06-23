import { css, FC, jsx, useEffect, useRef } from 'alumina';
import { Icon } from '~/ui/components';
import { projectKeyboardListCardCommonStyles } from '~/ui/fabrics/ProjectKeyboardList/ProjectKeyboardList.CardCommonStyles';

type Props = {
  onClick: () => void;
  onFileDrop: (filePath: string) => void;
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

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (file && file.type === 'application/json') {
        throw new Error('TODO: support importing package file');
        // onFileDrop(file.path);
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
            (*.kmpkg.json)
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
