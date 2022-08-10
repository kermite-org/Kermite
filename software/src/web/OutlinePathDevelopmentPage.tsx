import { css, domStyled, FC, jsx, useState } from 'alumina';
import svgPathBbox from 'svg-path-bbox';
import { reflectValue } from '~/ui/utils';

const initialPathText = `M 25,10
L 75,10
Q 83,10 85,20
L 90,50
Q 92, 60 80,60
L 30,60
L 10,70
Q 6,72 5,68
L 2,60
Q 1,57 5,55
L 20,48
L 15,20
Q 14,10 25,10
Z
`;

export const OutlinePathDevelopmentPage: FC = () => {
  const [pathText, setPathText] = useState(initialPathText);

  const bbox = svgPathBbox(pathText);

  const [bx0, by0, bx1, by1] = bbox;
  const bx = bx0;
  const by = by0;
  const bw = bx1 - bx0;
  const bh = by1 - by0;

  return domStyled(
    <div>
      <div class="main-row">
        <div class="preview-column">
          <svg>
            <g transform="scale(4)">
              <rect x={bx} y={by} width={bw} height={bh} />
              <path d={pathText} />
            </g>
          </svg>
        </div>
        <div class="edit-column">
          <textarea value={pathText} onInput={reflectValue(setPathText)} />
        </div>
      </div>
    </div>,
    css`
      padding: 20px;

      > .main-row {
        width: 800px;
        display: flex;
        > * {
          min-height: 400px;
          border: solid 1px #888;
        }

        > .preview-column {
          width: 400px;
          padding: 15px;
          > svg {
            width: 100%;
            height: 100%;
            path {
              fill: transparent;
              stroke: #f80;
              stroke-width: 1px;
            }

            rect {
              fill: transparent;
              stroke: #0cf;
              stroke-width: 0.3px;
            }
          }
        }

        > .edit-column {
          width: 300px;
          padding: 20px;

          > textarea {
            width: 100%;
            height: 100%;
            padding: 5px;
          }
        }
      }
    `,
  );
};
