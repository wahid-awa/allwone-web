import React, { useState } from 'react';

export const SQUARES = [
  { id: 0, role: 'organizer', label: { fr: 'Organisateur',  en: 'Organizer' },    color: '#d03736', x: 1346,    y: 810.04, w: 24.96, h: 24.96 },
  { id: 1, role: 'promoter',  label: { fr: 'Communication', en: 'Promoter' },     color: '#e58440', x: 1383.44, y: 810.04, w: 24.96, h: 24.96 },
  { id: 2, role: 'producer',  label: { fr: 'Production',    en: 'Producer' },     color: '#f5da58', x: 1420.19, y: 810.04, w: 24.96, h: 24.96 },
  { id: 3, role: 'dj',        label: { fr: 'DJ / Artiste',  en: 'DJ / Artist' },  color: '#479558', x: 1456.24, y: 810.04, w: 24.96, h: 24.96 },
  { id: 4, role: 'audience',  label: { fr: 'Passionné',     en: 'Enthusiast' },   color: '#1a6fa3', x: 1492.99, y: 810.04, w: 24.96, h: 24.96 },
  { id: 5, role: 'other',     label: { fr: 'Autre',         en: 'Other' },        color: '#6f3877', x: 1529.04, y: 810.04, w: 24.96, h: 24.96 },
];

interface AnimatedLogoProps {
  size?: number;
  forcedColorIndex?: number;
  onSelectColorIndex?: (index: number) => void;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 200,
  forcedColorIndex = -1,
  onSelectColorIndex,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndex = forcedColorIndex >= 0 ? forcedColorIndex : hoveredIndex;
  const activeColor = activeIndex !== null && activeIndex >= 0 ? SQUARES[activeIndex].color : null;

  return (
    <div
      style={{
        width: size,
        height: size * (310 / 260),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="1320 790 260 310"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {/* ── Top Color Squares ── */}
        {SQUARES.map((sq, i) => {
          const isSelected = activeIndex === i;
          return (
            <g
              key={sq.id}
              onClick={() => onSelectColorIndex && onSelectColorIndex(i)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={sq.x - 3} y={sq.y - 6} width={sq.w + 6} height={sq.h + 12} fill="transparent" />
              <rect
                x={sq.x}
                y={sq.y}
                width={sq.w}
                height={sq.h}
                rx="2"
                fill={sq.color}
                opacity={activeIndex === null || isSelected ? 1 : 0.35}
              />
            </g>
          );
        })}

        {/* ── Knot: left inner ── */}
        <path
          d="M1415.86,1047.75a34.84,34.84,0,0,1-12.12-2.19,36.36,36.36,0,0,1-23.29-28c-1.41-8.51-.84-25.17,18.78-41.12l15.1,18.57c-7.59,6.17-11.24,12.79-10.27,18.65a12.53,12.53,0,0,0,8,9.47,10.87,10.87,0,0,0,11.28-2.19c4.68-3.92,5.38-7.31,5.49-9.52.4-8-7-17.31-9-19.37-2.26-2.33-54.62-56.51-63.4-66.58-10.38-11.91-10.34-24.1-10-28.25V850.12h23.93v49.16l-.13.43c0,1,.11,5.34,4.2,10,8.37,9.6,62,65.07,62.53,65.63,1.69,1.73,16.72,17.75,15.73,37.25-.52,10.19-5.37,19.41-14,26.66A35.48,35.48,0,0,1,1415.86,1047.75Z"
          fill={activeIndex !== null && activeIndex <= 2 ? SQUARES[activeIndex].color : '#e5e5e5'}
        />

        {/* ── Knot: left outer ── */}
        <path
          d="M1371.68,1048.09h-23.94V999.65c-.13-3.82.17-22.62,17.76-39.32,14.66-13.91,51.74-53,52.11-53.39l.48-.47c.7-.68,17.94-17.5,7.6-31.15-3-4-8.47-3.47-10.67-3.06-5.58,1-10.35,4.74-11.58,9-1.6,5.54,2.35,13.21,10.82,21L1398,919.88c-21-19.46-20-36.71-17.57-45.27,3.76-13,15.62-23.17,30.21-25.88,13.67-2.54,26.42,2,34.1,12.14,18.52,24.44,1.7,51.58-10,62.77-3.38,3.56-38.11,40.11-52.78,54-10.06,9.55-10.33,19.8-10.32,21l0,.49,0,.18Zm0-49.46Z"
          fill={activeIndex === 0 ? SQUARES[0].color : '#e5e5e5'}
        />

        {/* ── Knot: right inner ── */}
        <path
          d="M1484.69,1047.75a35.38,35.38,0,0,1-22.81-8.48c-8.65-7.25-13.49-16.46-14-26.65-1-19.49,14-35.51,15.73-37.27.5-.53,54-56,62.36-65.6,4.13-4.75,4.23-9.1,4.19-10.08l-.29-1.19.17-.62V850.12H1554v47.09c.38,4.15.42,16.33-9.94,28.24-8.76,10.07-61,64.25-63.23,66.55-2.47,2.59-9.44,11.74-9,19.47.12,2.19.82,5.56,5.48,9.47a10.8,10.8,0,0,0,11.19,2.19,12.54,12.54,0,0,0,8-9.46c1-5.87-2.66-12.5-10.25-18.68l15.12-18.55c19.6,16,20.15,32.64,18.73,41.16a36.32,36.32,0,0,1-23.3,28A34.85,34.85,0,0,1,1484.69,1047.75Z"
          fill={activeIndex !== null && activeIndex >= 3 ? SQUARES[activeIndex].color : '#e5e5e5'}
        />

        {/* ── Knot: right outer ── */}
        <path
          d="M1552.68,1048.09h-23.93V998.8l0-.11c0-1.35-.33-11.53-10.3-21-14.56-13.85-48.92-50.08-52.61-54-11.92-11.13-29.06-38.07-10.55-62.56C1463,851,1475.82,846.41,1489.6,849c14.66,2.7,26.58,12.85,30.35,25.87,2.47,8.5,3.49,25.67-17.43,45l-16.26-17.55c8.39-7.78,12.29-15.37,10.71-20.84-1.24-4.25-6-8-11.71-9-2.25-.42-7.81-1-10.86,3.08-10.37,13.73,7.78,30.62,8,30.79l.61.6c.37.39,37.37,39.48,52,53.39,17.56,16.7,17.86,35.49,17.72,39.31Z"
          fill={activeIndex === 5 ? SQUARES[5].color : '#e5e5e5'}
        />

        {/* ── Center Cross ── */}
        <g style={{ transformOrigin: '1450px 948px' }}>
          <rect
            x="1438.42"
            y="924.13"
            width="23.93"
            height="47.67"
            transform="translate(-231.87 1363.04) rotate(-47.03)"
            fill={activeColor ?? '#ffffff'}
          />
          <rect
            x="1425.59"
            y="935.72"
            width="48.55"
            height="23.93"
            transform="translate(-265.63 1187.03) rotate(-41.11)"
            fill={activeColor ?? '#ffffff'}
          />
        </g>

        {/* ── Bottom Dot ── */}
        <circle
          cx="1450"
          cy="1075"
          r="14"
          fill={activeColor ?? '#e5e5e5'}
        />
      </svg>
    </div>
  );
};
