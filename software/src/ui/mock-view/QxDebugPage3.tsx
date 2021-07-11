import { css, FC, jsx } from 'qx';

export const QxDebugPage3: FC = () => {
  console.log(`render`);
  return (
    <div>
      <svg>
        <rect x={50} y={50} width={50} height={50} fill={'blue'} />
      </svg>
    </div>
  );
};
