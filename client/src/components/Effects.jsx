import React from 'react';

export default function Effects() {
  return (
    <svg className="animation" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {[...Array(5).keys()].map(i => (
          <filter id={`squiggly-${i}`} key={i}>
            <feTurbulence baseFrequency="0.016" numOctaves="2" result="noise" seed={`${i}`} />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={i % 2 === 0 ? 1.5 : 3} />
          </filter>
        ))}
      </defs>
    </svg>
  );
} 