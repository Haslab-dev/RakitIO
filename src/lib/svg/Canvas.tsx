import React, { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

interface CanvasProps {
  children: ReactNode;
  width?: number;
  height?: number;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

export function Canvas({ children, width = 1200, height = 800 }: CanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        e.preventDefault();
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY };
        panOrigin.current = { ...pan };
      }
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({
          x: panOrigin.current.x + (e.clientX - panStart.current.x),
          y: panOrigin.current.y + (e.clientY - panStart.current.y),
        });
      }
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const prevent = (e: WheelEvent) => e.preventDefault();
    el.addEventListener('wheel', prevent, { passive: false });
    return () => el.removeEventListener('wheel', prevent);
  }, []);

  const zoomPercent = Math.round(zoom * 100);

  const gridPatternId = 'canvas-grid-pattern';
  const gridSize = 20;
  const scaledGrid = gridSize * zoom;

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', background: '#1a1a2e' }}>
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          background: 'rgba(30,30,50,0.9)',
          borderRadius: 6,
          padding: '4px 8px',
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          style={{
            background: '#374151',
            color: '#E5E7EB',
            border: 'none',
            borderRadius: 4,
            width: 28,
            height: 28,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          −
        </button>
        <span style={{ color: '#D1D5DB', fontSize: 12, minWidth: 44, textAlign: 'center', fontFamily: 'monospace' }}>
          {zoomPercent}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          style={{
            background: '#374151',
            color: '#E5E7EB',
            border: 'none',
            borderRadius: 4,
            width: 28,
            height: 28,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          style={{
            background: '#374151',
            color: '#E5E7EB',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: 11,
            marginLeft: 4,
          }}
        >
          Reset
        </button>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isPanning ? 'grabbing' : 'default',
          userSelect: 'none',
        }}
      >
        <defs>
          <pattern
            id={gridPatternId}
            width={scaledGrid}
            height={scaledGrid}
            patternUnits="userSpaceOnUse"
            x={pan.x % scaledGrid}
            y={pan.y % scaledGrid}
          >
            <rect width={scaledGrid} height={scaledGrid} fill="none" />
            <circle
              cx={scaledGrid / 2}
              cy={scaledGrid / 2}
              r={1}
              fill="rgba(255,255,255,0.08)"
            />
          </pattern>
        </defs>

        <rect width={width} height={height} fill={`url(#${gridPatternId})`} />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {children}
        </g>
      </svg>
    </div>
  );
}
