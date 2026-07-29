import { useId } from "react";
import type { EstimateInput } from "@/lib/schemas/estimate";

export interface FloorPlanProps {
  /** Общая площадь квартиры, м² */
  area: number;
  /** Количество жилых комнат (без учёта санузлов) */
  rooms: number;
  /** Количество санузлов */
  bathrooms: number;
  layoutChange: EstimateInput["layoutChange"];
  className?: string;
}

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 800;
const MARGIN = 60;
const BATHROOM_ZONE_WIDTH = 220;
const GAP = 4;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const BATHROOM_AREA_PER_UNIT = 4.5;

interface CellRect {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  index: number;
}

interface Layout {
  rooms: CellRect[];
  bathroomCells: CellRect[];
  innerX: number;
  innerY: number;
  innerWidth: number;
  innerHeight: number;
  bathroomZoneX: number;
  livingZoneWidth: number;
}

/**
 * Чисто детерминированная раскладка: одинаковые пропсы всегда дают одну и ту же
 * геометрию (никакого Math.random) — это то, что делает перерисовку при смене
 * пропсов плавной, а не дёргающейся.
 */
function buildLayout(area: number, rooms: number, bathrooms: number): Layout {
  const safeRooms = Math.max(1, Math.round(rooms));
  const safeBathrooms = Math.max(1, Math.round(bathrooms));
  const safeArea = Math.max(1, area);

  const bathroomsTotalArea = Math.min(
    safeBathrooms * BATHROOM_AREA_PER_UNIT,
    safeArea * 0.35,
  );
  const livingArea = safeArea - bathroomsTotalArea;

  const innerX = MARGIN;
  const innerY = MARGIN;
  const innerWidth = VIEW_WIDTH - MARGIN * 2;
  const innerHeight = VIEW_HEIGHT - MARGIN * 2;

  const bathroomZoneWidth = BATHROOM_ZONE_WIDTH;
  const livingZoneWidth = innerWidth - bathroomZoneWidth - GAP;

  // Первая комната — самая крупная (гостиная), остальные — поровну.
  const weights = Array.from({ length: safeRooms }, (_, i) =>
    i === 0 ? 1.5 : 1,
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let cursorX = innerX;
  const rooms_: CellRect[] = weights.map((w, i) => {
    const widthFraction = w / totalWeight;
    const isLast = i === weights.length - 1;
    const width = livingZoneWidth * widthFraction - (isLast ? 0 : GAP);
    const rect: CellRect = {
      x: cursorX,
      y: innerY,
      width,
      height: innerHeight,
      area: livingArea * widthFraction,
      index: i,
    };
    cursorX += width + GAP;
    return rect;
  });

  const bathroomZoneX = innerX + livingZoneWidth + GAP;
  const bathroomCellHeight =
    (innerHeight - GAP * (safeBathrooms - 1)) / safeBathrooms;

  let cursorY = innerY;
  const bathroomCells: CellRect[] = Array.from(
    { length: safeBathrooms },
    (_, i) => {
      const rect: CellRect = {
        x: bathroomZoneX,
        y: cursorY,
        width: bathroomZoneWidth,
        height: bathroomCellHeight,
        area: bathroomsTotalArea / safeBathrooms,
        index: i,
      };
      cursorY += bathroomCellHeight + GAP;
      return rect;
    },
  );

  return {
    rooms: rooms_,
    bathroomCells,
    innerX,
    innerY,
    innerWidth,
    innerHeight,
    bathroomZoneX,
    livingZoneWidth,
  };
}

function pluralizeRu(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function formatArea(value: number): string {
  return `${value.toFixed(1)} м²`;
}

const geometryTransition = {
  transition: "x 300ms, y 300ms, width 300ms, height 300ms",
  transitionTimingFunction: EASE,
} as const;

export function FloorPlan({
  area,
  rooms,
  bathrooms,
  layoutChange,
  className,
}: FloorPlanProps) {
  const layout = buildLayout(area, rooms, bathrooms);
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const roughHatchId = `${uid}-rough-hatch`;
  const finishPlanksId = `${uid}-finish-planks`;

  const roomsPartitionsDashed = layoutChange === "partitions";
  const wetZonesDashed = layoutChange === "wetZones";

  const roomsWord = pluralizeRu(
    layout.rooms.length,
    "комната",
    "комнаты",
    "комнат",
  );
  const bathroomsWord = pluralizeRu(
    layout.bathroomCells.length,
    "санузел",
    "санузла",
    "санузлов",
  );

  const description = [
    `Квартира площадью ${formatArea(area)}, ${layout.rooms.length} ${roomsWord}, ${layout.bathroomCells.length} ${bathroomsWord}.`,
    ...layout.rooms.map(
      (room, i) => `Комната ${i + 1}: ${formatArea(room.area)}.`,
    ),
    ...layout.bathroomCells.map(
      (cell, i) => `Санузел ${i + 1}: ${formatArea(cell.area)}.`,
    ),
    layoutChange === "partitions"
      ? "Планировка предусматривает перенос перегородок."
      : layoutChange === "wetZones"
        ? "Планировка предусматривает перенос мокрых зон."
        : "Перепланировка не требуется.",
  ].join(" ");

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>
        {`Планировка квартиры ${formatArea(area)}, ${layout.rooms.length} ${roomsWord}`}
      </title>
      <desc id={descId}>{description}</desc>

      <g id="rough" opacity={0.08}>
        <defs>
          <pattern
            id={roughHatchId}
            width={16}
            height={16}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={16}
              stroke="var(--graphite)"
              strokeWidth={2}
            />
          </pattern>
        </defs>
        <rect
          x={layout.innerX}
          y={layout.innerY}
          width={layout.innerWidth}
          height={layout.innerHeight}
          fill={`url(#${roughHatchId})`}
        />
      </g>

      <g id="finish" opacity={0.06}>
        <defs>
          <pattern
            id={finishPlanksId}
            width={40}
            height={10}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1={0}
              y1={10}
              x2={40}
              y2={10}
              stroke="var(--graphite)"
              strokeWidth={1}
            />
          </pattern>
        </defs>
        <rect
          x={layout.innerX}
          y={layout.innerY}
          width={layout.innerWidth}
          height={layout.innerHeight}
          fill={`url(#${finishPlanksId})`}
        />
      </g>

      <g id="walls" fill="none" stroke="var(--graphite)" strokeWidth={3}>
        <path
          id="wall-perimeter"
          d={`M ${layout.innerX} ${layout.innerY} H ${layout.innerX + layout.innerWidth} V ${layout.innerY + layout.innerHeight} H ${layout.innerX} Z`}
        />

        {layout.rooms.slice(0, -1).map((room, i) => {
          const x = room.x + room.width + GAP / 2;
          return (
            <path
              key={`wall-room-${i}`}
              id={`wall-room-${i}`}
              d={`M ${x} ${layout.innerY} V ${layout.innerY + layout.innerHeight}`}
              strokeDasharray={roomsPartitionsDashed ? "10 6" : undefined}
              style={geometryTransition}
            />
          );
        })}

        <path
          id="wall-bathroom-zone"
          d={`M ${layout.bathroomZoneX - GAP / 2} ${layout.innerY} V ${layout.innerY + layout.innerHeight}`}
          strokeDasharray={wetZonesDashed ? "10 6" : undefined}
          style={geometryTransition}
        />

        {layout.bathroomCells.slice(0, -1).map((cell, i) => {
          const y = cell.y + cell.height + GAP / 2;
          return (
            <path
              key={`wall-bathroom-${i}`}
              id={`wall-bathroom-${i}`}
              d={`M ${layout.bathroomZoneX} ${y} H ${layout.bathroomZoneX + BATHROOM_ZONE_WIDTH}`}
              strokeDasharray={wetZonesDashed ? "10 6" : undefined}
              style={geometryTransition}
            />
          );
        })}
      </g>

      <g id="plumbing" stroke="var(--blueprint)" fill="none" strokeWidth={2}>
        {layout.bathroomCells.map((cell, i) => {
          const cx = cell.x + cell.width / 2;
          const cy = cell.y + cell.height / 2;
          return (
            <g key={`plumbing-${i}`} style={geometryTransition}>
              <ellipse cx={cx - 30} cy={cy + 20} rx={22} ry={16} />
              <rect x={cx + 10} y={cy - 30} width={50} height={26} rx={4} />
            </g>
          );
        })}
      </g>

      <g
        id="furniture"
        fill="var(--grid)"
        stroke="var(--graphite)"
        strokeWidth={1.5}
      >
        {layout.rooms.map((room, i) => {
          const cx = room.x + room.width / 2;
          const cy = room.y + room.height / 2;
          if (i === 0) {
            const bedWidth = Math.min(160, room.width * 0.5);
            return (
              <rect
                key={`furniture-${i}`}
                x={cx - bedWidth / 2}
                y={cy - 60}
                width={bedWidth}
                height={100}
                rx={6}
                style={geometryTransition}
              />
            );
          }
          if (room.width > 90) {
            return (
              <circle
                key={`furniture-${i}`}
                cx={cx}
                cy={cy}
                r={Math.min(40, room.width * 0.22)}
                style={geometryTransition}
              />
            );
          }
          return null;
        })}
      </g>

      <g
        id="dimensions"
        className="font-mono"
        fill="var(--graphite)"
        stroke="var(--graphite)"
        strokeWidth={1}
      >
        <text
          x={layout.innerX + layout.innerWidth / 2}
          y={MARGIN * 0.55}
          textAnchor="middle"
          fontSize={28}
          fontWeight={500}
        >
          {formatArea(area)}
        </text>

        {layout.rooms.map((room, i) => (
          <g key={`dim-room-${i}`} style={geometryTransition}>
            <line
              x1={room.x + 8}
              y1={room.y + room.height - 14}
              x2={room.x + room.width - 8}
              y2={room.y + room.height - 14}
              strokeWidth={1}
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height - 22}
              textAnchor="middle"
              fontSize={16}
              stroke="none"
            >
              {formatArea(room.area)}
            </text>
          </g>
        ))}

        {layout.bathroomCells.map((cell, i) => (
          <text
            key={`dim-bathroom-${i}`}
            x={cell.x + cell.width / 2}
            y={cell.y + cell.height - 10}
            textAnchor="middle"
            fontSize={14}
            stroke="none"
            style={geometryTransition}
          >
            {formatArea(cell.area)}
          </text>
        ))}
      </g>
    </svg>
  );
}
