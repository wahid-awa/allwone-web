import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { synth } from '../utils/audioSynth';

interface SquareData {
  id: number;
  name: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const SQUARES: SquareData[] = [
  { id: 0, name: 'Coral Red', color: '#d03736', x: 1346, y: 810.04, w: 24.96, h: 24.96 },
  { id: 1, name: 'Amber Orange', color: '#e58440', x: 1383.44, y: 810.04, w: 24.96, h: 24.96 },
  { id: 2, name: 'Solar Yellow', color: '#f5da58', x: 1420.19, y: 810.04, w: 24.96, h: 24.96 },
  { id: 3, name: 'Emerald Green', color: '#479558', x: 1456.24, y: 810.04, w: 24.96, h: 24.96 },
  { id: 4, name: 'Electric Blue', color: '#1a6fa3', x: 1492.99, y: 810.04, w: 24.96, h: 24.96 },
  { id: 5, name: 'Deep Purple', color: '#6f3877', x: 1529.04, y: 810.04, w: 24.96, h: 24.96 },
];

export const AnimatedLogo: React.FC = () => {
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax / 3D tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredSquare(null);
  };

  const handleSquareHover = (index: number) => {
    setHoveredSquare(index);
    synth.playColorNote(index);
  };

  const activeSquare = hoveredSquare !== null ? SQUARES[hoveredSquare] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-80 sm:w-96 md:w-[460px] h-[400px] sm:h-[480px] md:h-[520px] flex items-center justify-center cursor-pointer select-none"
      style={{ perspective: 1200 }}
    >
      {/* Ambient background glow responding to the active color or rainbow */}
      <motion.div
        animate={{
          background: activeSquare
            ? `radial-gradient(circle, ${activeSquare.color}35 0%, rgba(0,0,0,0) 70%)`
            : 'radial-gradient(circle, rgba(208, 55, 54, 0.15) 0%, rgba(26, 111, 163, 0.15) 50%, rgba(0,0,0,0) 70%)',
          scale: hoveredSquare !== null ? 1.3 : [1, 1.08, 1],
        }}
        transition={{
          scale: hoveredSquare !== null ? { duration: 0.4 } : { repeat: Infinity, duration: 6, ease: 'easeInOut' },
          background: { duration: 0.5 },
        }}
        className="absolute inset-0 pointer-events-none rounded-full filter blur-3xl -z-10"
      />

      {/* Continuously floating & tilting SVG logo */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="1320 780 260 330"
        className="w-full h-full filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]"
        animate={{
          y: [-6, 6, -6],
          rotateX: -mousePos.y * 22,
          rotateY: mousePos.x * 22,
          rotateZ: [-0.5, 0.5, -0.5],
        }}
        transition={{
          y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
          rotateZ: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
          rotateX: { type: 'spring', stiffness: 120, damping: 15 },
          rotateY: { type: 'spring', stiffness: 120, damping: 15 },
        }}
      >
        <defs>
          {/* Dynamic neon glow filters for each color */}
          {SQUARES.map((sq) => (
            <filter id={`glow-${sq.id}`} key={sq.id} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={sq.color} floodOpacity="0.9" />
              <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor={sq.color} floodOpacity="0.6" />
            </filter>
          ))}
        </defs>

        {/* Light beam shooting down into the knot on square hover */}
        <AnimatePresence>
          {hoveredSquare !== null && (
            <motion.line
              initial={{ opacity: 0, y2: 835 }}
              animate={{ opacity: [0, 0.9, 0.5], y2: [835, 1020, 990] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              x1={SQUARES[hoveredSquare].x + 12.48}
              y1={SQUARES[hoveredSquare].y + 24.96}
              x2={SQUARES[hoveredSquare].x + 12.48}
              stroke={SQUARES[hoveredSquare].color}
              strokeWidth="2.5"
              strokeDasharray="4 3"
              filter={`url(#glow-${hoveredSquare})`}
            />
          )}
        </AnimatePresence>

        {/* ========================================================== */}
        {/* 1. THE 6 COLOR SQUARES (With Chain Reaction on Hover)       */}
        {/* ========================================================== */}
        <g id="spectrum-squares">
          {SQUARES.map((sq, index) => {
            const isThisHovered = hoveredSquare === index;
            const distance = hoveredSquare !== null ? Math.abs(hoveredSquare - index) : null;

            // Chained offset calculation:
            // When hovering one square, adjacent squares react with domino ripple wave
            let yOffset = 0;
            let scale = 1;

            if (isThisHovered) {
              yOffset = -16;
              scale = 1.35;
            } else if (distance !== null) {
              // Wave propagation
              yOffset = -Math.max(0, 11 - distance * 3.8);
              scale = 1 + Math.max(0, 0.22 - distance * 0.05);
            } else {
              // Continuous subtle ambient wave motion when not hovered
              yOffset = Math.sin(Date.now() / 600 + index * 0.9) * 4;
            }

            return (
              <motion.g
                key={sq.id}
                onMouseEnter={() => handleSquareHover(index)}
                animate={{
                  y: yOffset,
                  scale: scale,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 18,
                  mass: 0.5,
                  delay: distance !== null && !isThisHovered ? distance * 0.04 : 0,
                }}
                style={{
                  transformOrigin: `${sq.x + 12.5}px ${sq.y + 12.5}px`,
                }}
              >
                {/* Active halo */}
                {isThisHovered && (
                  <rect
                    x={sq.x - 3}
                    y={sq.y - 3}
                    width={sq.w + 6}
                    height={sq.h + 6}
                    rx="4"
                    fill="none"
                    stroke={sq.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.8"
                    filter={`url(#glow-${sq.id})`}
                  />
                )}

                {/* Main Square */}
                <rect
                  x={sq.x}
                  y={sq.y}
                  width={sq.w}
                  height={sq.h}
                  rx="3"
                  fill={sq.color}
                  filter={isThisHovered || (distance !== null && distance <= 1) ? `url(#glow-${sq.id})` : undefined}
                />

                {/* Gloss highlight */}
                <rect
                  x={sq.x + 2}
                  y={sq.y + 2}
                  width={sq.w - 4}
                  height={sq.h / 3}
                  rx="1.5"
                  fill="#ffffff"
                  fillOpacity="0.3"
                />
              </motion.g>
            );
          })}
        </g>

        {/* ========================================================== */}
        {/* 2. THE KNOT BODY (Arabic Waw و Braids + Cross + Anchor)    */}
        {/* ========================================================== */}
        <motion.g id="knot-body">
          {/* Left Inner Knot Path */}
          <motion.path
            id="knot-left-inner"
            d="M1415.86,1047.75a34.84,34.84,0,0,1-12.12-2.19,36.36,36.36,0,0,1-23.29-28c-1.41-8.51-.84-25.17,18.78-41.12l15.1,18.57c-7.59,6.17-11.24,12.79-10.27,18.65a12.53,12.53,0,0,0,8,9.47,10.87,10.87,0,0,0,11.28-2.19c4.68-3.92,5.38-7.31,5.49-9.52.4-8-7-17.31-9-19.37-2.26-2.33-54.62-56.51-63.4-66.58-10.38-11.91-10.34-24.1-10-28.25V850.12h23.93v49.16l-.13.43c0,1,.11,5.34,4.2,10,8.37,9.6,62,65.07,62.53,65.63,1.69,1.73,16.72,17.75,15.73,37.25-.52,10.19-5.37,19.41-14,26.66A35.48,35.48,0,0,1,1415.86,1047.75Z"
            fill={hoveredSquare !== null && hoveredSquare <= 2 ? SQUARES[hoveredSquare].color : '#f3f4f6'}
            stroke={hoveredSquare !== null && hoveredSquare <= 2 ? SQUARES[hoveredSquare].color : '#18181b'}
            strokeWidth="0.5"
            className="transition-colors duration-300"
          />

          {/* Left Outer Knot Path */}
          <motion.path
            id="knot-left-outer"
            d="M1371.68,1048.09h-23.94V999.65c-.13-3.82.17-22.62,17.76-39.32,14.66-13.91,51.74-53,52.11-53.39l.48-.47c.7-.68,17.94-17.5,7.6-31.15-3-4-8.47-3.47-10.67-3.06-5.58,1-10.35,4.74-11.58,9-1.6,5.54,2.35,13.21,10.82,21L1398,919.88c-21-19.46-20-36.71-17.57-45.27,3.76-13,15.62-23.17,30.21-25.88,13.67-2.54,26.42,2,34.1,12.14,18.52,24.44,1.7,51.58-10,62.77-3.38,3.56-38.11,40.11-52.78,54-10.06,9.55-10.33,19.8-10.32,21l0,.49,0,.18Zm0-49.46Z"
            fill={hoveredSquare === 0 ? SQUARES[0].color : '#f3f4f6'}
            stroke="#18181b"
            strokeWidth="0.5"
            className="transition-colors duration-300"
          />

          {/* Right Inner Knot Path */}
          <motion.path
            id="knot-right-inner"
            d="M1484.69,1047.75a35.38,35.38,0,0,1-22.81-8.48c-8.65-7.25-13.49-16.46-14-26.65-1-19.49,14-35.51,15.73-37.27.5-.53,54-56,62.36-65.6,4.13-4.75,4.23-9.1,4.19-10.08l-.29-1.19.17-.62V850.12H1554v47.09c.38,4.15.42,16.33-9.94,28.24-8.76,10.07-61,64.25-63.23,66.55-2.47,2.59-9.44,11.74-9,19.47.12,2.19.82,5.56,5.48,9.47a10.8,10.8,0,0,0,11.19,2.19,12.54,12.54,0,0,0,8-9.46c1-5.87-2.66-12.5-10.25-18.68l15.12-18.55c19.6,16,20.15,32.64,18.73,41.16a36.32,36.32,0,0,1-23.3,28A34.85,34.85,0,0,1,1484.69,1047.75Zm45.5-147.9Z"
            fill={hoveredSquare !== null && hoveredSquare >= 3 ? SQUARES[hoveredSquare].color : '#f3f4f6'}
            stroke="#18181b"
            strokeWidth="0.5"
            className="transition-colors duration-300"
          />

          {/* Right Outer Knot Path */}
          <motion.path
            id="knot-right-outer"
            d="M1552.68,1048.09h-23.93V998.8l0-.11c0-1.35-.33-11.53-10.3-21-14.56-13.85-48.92-50.08-52.61-54-11.92-11.13-29.06-38.07-10.55-62.56C1463,851,1475.82,846.41,1489.6,849c14.66,2.7,26.58,12.85,30.35,25.87,2.47,8.5,3.49,25.67-17.43,45l-16.26-17.55c8.39-7.78,12.29-15.37,10.71-20.84-1.24-4.25-6-8-11.71-9-2.25-.42-7.81-1-10.86,3.08-10.37,13.73,7.78,30.62,8,30.79l.61.6c.37.39,37.37,39.48,52,53.39,17.56,16.7,17.86,35.49,17.72,39.31Z"
            fill={hoveredSquare === 5 ? SQUARES[5].color : '#f3f4f6'}
            stroke="#18181b"
            strokeWidth="0.5"
            className="transition-colors duration-300"
          />

          {/* Central Diamond Cross */}
          <motion.g
            id="center-cross"
            animate={{
              rotate: hoveredSquare !== null ? hoveredSquare * 30 : 0,
              scale: hoveredSquare !== null ? 1.15 : 1,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            style={{ transformOrigin: '1450px 948px' }}
          >
            <rect
              x="1438.42"
              y="924.13"
              width="23.93"
              height="47.67"
              transform="translate(-231.87 1363.04) rotate(-47.03)"
              fill={activeSquare ? activeSquare.color : '#ffffff'}
              className="transition-colors duration-300"
            />
            <rect
              x="1425.59"
              y="935.72"
              width="48.55"
              height="23.93"
              transform="translate(-265.63 1187.03) rotate(-41.11)"
              fill={activeSquare ? activeSquare.color : '#ffffff'}
              className="transition-colors duration-300"
            />
          </motion.g>

          {/* Bottom Diacritic Dot */}
          <motion.circle
            id="bottom-dot"
            cx="1450"
            cy="1075"
            r="14"
            fill={activeSquare ? activeSquare.color : '#f3f4f6'}
            animate={{
              scale: hoveredSquare !== null ? [1, 1.4, 1.15] : 1,
              cy: hoveredSquare !== null ? 1078 : 1075,
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            filter={activeSquare ? `url(#glow-${activeSquare.id})` : undefined}
            className="transition-colors duration-300"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
};
