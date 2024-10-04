import React from 'react';
import { useId } from 'react';

const DotPattern = ({
  width = 20,
  height = 20,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  children,
  ...props
}) => {
  const id = useId();

  return (
    <div className="relative overflow-hidden">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80"
        {...props}
      >
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
            x={x}
            y={y}
          >
            <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      </svg>
      {children}
    </div>
  );
};

export default DotPattern;