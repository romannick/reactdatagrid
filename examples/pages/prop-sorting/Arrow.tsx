import { CSSProperties, ReactElement } from 'react';

type Arrows = {
  down: ReactElement;
  up: ReactElement;
  activeDown: ReactElement;
  activeUp: ReactElement;
};

const arrows: Arrows = {
  down: <path d="m12 15-5-5h10Z" />,
  up: (
    <g transform="rotate(180) translate(-24 -24)">
      <path d="m12 15-5-5h10Z" />
    </g>
  ),
  activeDown: <path fill="red" d="m12 15-5-5h10Z" />,
  activeUp: (
    <g transform="rotate(180) translate(-24 -24)">
      <path fill="red" d="m12 15-5-5h10Z" />
    </g>
  ),
};

const Arrow = ({ type, style }: { type: string; style: CSSProperties }) => {
  return (
    <svg style={style} height="12" width="12" viewBox="0 0 12 12">
      <g transform="translate(-6 -6)">{arrows[type as keyof Arrows]}</g>
    </svg>
  );
};

export default Arrow;
