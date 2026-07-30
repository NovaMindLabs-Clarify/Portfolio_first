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
const BATHROOM_ASPECT = 1.15;
const GAP = 4;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const BATHROOM_AREA_PER_UNIT = 4.5;
const DOOR_WIDTH = 40;
const WINDOW_LENGTH = 46;
const WINDOW_OFFSET = 3;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CellRect extends Rect {
  area: number;
  index: number;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Layout {
  rooms: CellRect[];
  bathroomCells: CellRect[];
  corridorRect: Rect;
  corridorArea: number;
  roomPartitions: Segment[];
  corridorDoors: Segment[];
  bathroomDoors: Segment[];
  entranceDoor: Segment;
  windows: Segment[];
  innerX: number;
  innerY: number;
  innerWidth: number;
  innerHeight: number;
  bathroomZoneX: number;
  bathroomZoneWidth: number;
  corridorWidth: number;
}

/** Комната 0 — самая крупная (гостиная), дальше вес по убыванию. */
const ROOM_WEIGHTS = [1.8, 1.2, 1.0, 0.9, 0.8, 0.7];

/**
 * Треугольная (slice-and-dice) раскладка с чередованием оси реза — даёт
 * комнаты РАЗНОГО размера и пропорций вместо одинаковых полос, плюс список
 * общих стен между соседними комнатами для дверных проёмов.
 */
function splitRooms(
  rect: Rect,
  weights: number[],
  axis: "x" | "y",
): { rects: Rect[]; partitions: Segment[] } {
  if (weights.length === 1) {
    return { rects: [rect], partitions: [] };
  }
  const total = weights.reduce((sum, w) => sum + w, 0);
  const fraction = weights[0] / total;
  const nextAxis = axis === "x" ? "y" : "x";

  if (axis === "x") {
    const w = rect.width * fraction;
    const first: Rect = {
      x: rect.x,
      y: rect.y,
      width: w - GAP / 2,
      height: rect.height,
    };
    const restRect: Rect = {
      x: rect.x + w + GAP / 2,
      y: rect.y,
      width: rect.width - w - GAP / 2,
      height: rect.height,
    };
    const lineX = rect.x + w;
    const rest = splitRooms(restRect, weights.slice(1), nextAxis);
    return {
      rects: [first, ...rest.rects],
      partitions: [
        { x1: lineX, y1: rect.y, x2: lineX, y2: rect.y + rect.height },
        ...rest.partitions,
      ],
    };
  }

  const h = rect.height * fraction;
  const first: Rect = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: h - GAP / 2,
  };
  const restRect: Rect = {
    x: rect.x,
    y: rect.y + h + GAP / 2,
    width: rect.width,
    height: rect.height - h - GAP / 2,
  };
  const lineY = rect.y + h;
  const rest = splitRooms(restRect, weights.slice(1), nextAxis);
  return {
    rects: [first, ...rest.rects],
    partitions: [
      { x1: rect.x, y1: lineY, x2: rect.x + rect.width, y2: lineY },
      ...rest.partitions,
    ],
  };
}

function buildLayout(area: number, rooms: number, bathrooms: number): Layout {
  const safeRooms = Math.min(6, Math.max(1, Math.round(rooms)));
  const safeBathrooms = Math.max(1, Math.round(bathrooms));
  const safeArea = Math.max(1, area);

  const bathroomsTotalArea = Math.min(
    safeBathrooms * BATHROOM_AREA_PER_UNIT,
    safeArea * 0.35,
  );
  // Прихожая — тоже реальная площадь квартиры, а не бесхозная пустота: без
  // неё за жилую площадь ошибочно засчитывался и вход, и санузлы разом.
  const corridorArea = Math.min(8, Math.max(3, safeArea * 0.05));
  const livingArea = safeArea - bathroomsTotalArea - corridorArea;

  const innerX = MARGIN;
  const innerY = MARGIN;
  const innerWidth = VIEW_WIDTH - MARGIN * 2;
  const innerHeight = VIEW_HEIGHT - MARGIN * 2;

  // Санузел считаем ПОЧТИ квадратным по реальным м² (через масштаб всей
  // квартиры) — и высота, и ширина следуют за площадью, а не только высота
  // при фиксированной ширине (иначе маленький санузел всё равно выглядит
  // широким и "огромным" на плане).
  const scale = Math.sqrt((innerWidth * innerHeight) / safeArea);
  const areaPerBathroom = bathroomsTotalArea / safeBathrooms;
  const bathroomAreaUnits2 = areaPerBathroom * scale * scale;
  const rawBathroomHeight = Math.sqrt(bathroomAreaUnits2 / BATHROOM_ASPECT);
  const bathroomCellHeight = Math.min(160, Math.max(70, rawBathroomHeight));
  const bathroomCellWidth = Math.min(
    200,
    Math.max(70, bathroomCellHeight * BATHROOM_ASPECT),
  );

  // Несколько санузлов ставим В РЯД у прихожей (общая мокрая стена экономит
  // трубы — так делают в типовых планировках), а не друг над другом по
  // высоте: друг над другом на одном этаже санузлы не бывают, и вдобавок
  // у каждого теперь свой отдельный вход, а не один на всех.
  const bathroomZoneWidth =
    bathroomCellWidth * safeBathrooms + GAP * (safeBathrooms - 1);

  // Санузлы стоят вровень с прихожей, в той же нижней полосе у входа — не
  // отдельной колонкой на всю высоту квартиры и не отдельным этажом.
  const corridorHeight = Math.round(innerHeight * 0.14);
  const bandHeight = Math.max(corridorHeight, bathroomCellHeight);
  const livingHeight = innerHeight - bandHeight - GAP;
  const corridorWidth = innerWidth - bathroomZoneWidth - GAP;
  const bathroomZoneX = innerX + corridorWidth + GAP;

  const livingRect: Rect = {
    x: innerX,
    y: innerY,
    width: innerWidth,
    height: livingHeight,
  };
  const corridorRect: Rect = {
    x: innerX,
    y: innerY + livingHeight + GAP,
    width: corridorWidth,
    height: bandHeight,
  };

  const weights = ROOM_WEIGHTS.slice(0, safeRooms);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const { rects: roomRects, partitions: roomPartitions } = splitRooms(
    livingRect,
    weights,
    "x",
  );
  const rooms_: CellRect[] = roomRects.map((r, i) => ({
    ...r,
    area: livingArea * (weights[i] / totalWeight),
    index: i,
  }));

  // Дверь из коридора — в каждую комнату нижнего ряда, но только там, где
  // она граничит именно с прихожей, а не с зоной санузлов правее неё.
  const corridorDoors: Segment[] = rooms_
    .filter(
      (r) => Math.abs(r.y + r.height - livingRect.height - livingRect.y) < 0.5,
    )
    .flatMap((r) => {
      const x1 = Math.max(r.x, corridorRect.x);
      const x2 = Math.min(r.x + r.width, corridorRect.x + corridorRect.width);
      if (x2 - x1 < 1) return [];
      return [{ x1, y1: livingRect.y + livingRect.height, x2, y2: livingRect.y + livingRect.height }];
    });

  // Санузлы — в ряд, вровень с прихожей, прижаты к общей нижней стене.
  const bathroomCells: CellRect[] = [];
  let cursorX = bathroomZoneX;
  for (let i = 0; i < safeBathrooms; i++) {
    bathroomCells.push({
      x: cursorX,
      y: corridorRect.y,
      width: bathroomCellWidth,
      height: bandHeight,
      area: areaPerBathroom,
      index: i,
    });
    cursorX += bathroomCellWidth + GAP;
  }

  // Первый санузел — гостевой, дверь из прихожей (общая стена слева).
  // Остальные стоят рядом (общая мокрая стена для экономии труб), но у
  // каждого свой отдельный вход — сверху, из жилой комнаты над ним.
  const bathroomDoors: Segment[] = bathroomCells.map((cell, i) =>
    i === 0
      ? {
          x1: bathroomZoneX - GAP / 2,
          y1: corridorRect.y,
          x2: bathroomZoneX - GAP / 2,
          y2: corridorRect.y + corridorRect.height,
        }
      : {
          x1: cell.x,
          y1: livingRect.y + livingRect.height,
          x2: cell.x + cell.width,
          y2: livingRect.y + livingRect.height,
        },
  );

  // Входная дверь — с лестницы прямо в прихожую, по центру её внешней стены.
  const entranceDoorWidth = Math.min(
    DOOR_WIDTH * 1.4,
    corridorRect.width * 0.4,
  );
  const entranceDoorX = corridorRect.x + corridorRect.width / 2;
  const entranceDoor: Segment = {
    x1: entranceDoorX - entranceDoorWidth / 2,
    y1: innerY + innerHeight,
    x2: entranceDoorX + entranceDoorWidth / 2,
    y2: innerY + innerHeight,
  };

  // Окна — только на внешних стенах: верх и левый край жилой зоны, нижняя
  // стена санузлов (мокрые зоны собраны у одной внешней стены).
  const windows: Segment[] = [];
  for (const r of rooms_) {
    if (Math.abs(r.y - innerY) < 0.5) {
      const cx = r.x + r.width / 2;
      windows.push({
        x1: cx - WINDOW_LENGTH / 2,
        y1: innerY,
        x2: cx + WINDOW_LENGTH / 2,
        y2: innerY,
      });
    }
    if (Math.abs(r.x - innerX) < 0.5) {
      const cy = r.y + r.height / 2;
      windows.push({
        x1: innerX,
        y1: cy - WINDOW_LENGTH / 2,
        x2: innerX,
        y2: cy + WINDOW_LENGTH / 2,
      });
    }
  }
  for (const cell of bathroomCells) {
    const cx = cell.x + cell.width / 2;
    const y = innerY + innerHeight;
    windows.push({
      x1: cx - WINDOW_LENGTH / 2,
      y1: y,
      x2: cx + WINDOW_LENGTH / 2,
      y2: y,
    });
  }

  return {
    rooms: rooms_,
    bathroomCells,
    corridorRect,
    corridorArea,
    roomPartitions,
    corridorDoors,
    bathroomDoors,
    entranceDoor,
    windows,
    innerX,
    innerY,
    innerWidth,
    innerHeight,
    bathroomZoneX,
    bathroomZoneWidth,
    corridorWidth,
  };
}

/** Путь стены с разрывом-проёмом по центру (или без, если door=false). */
function wallPath(seg: Segment, door: boolean): string {
  const isHorizontal = seg.y1 === seg.y2;
  if (!door) {
    return `M ${seg.x1} ${seg.y1} L ${seg.x2} ${seg.y2}`;
  }
  if (isHorizontal) {
    const midX = (seg.x1 + seg.x2) / 2;
    const half = Math.min(DOOR_WIDTH, Math.abs(seg.x2 - seg.x1) * 0.6) / 2;
    return `M ${seg.x1} ${seg.y1} H ${midX - half} M ${midX + half} ${seg.y1} H ${seg.x2}`;
  }
  const midY = (seg.y1 + seg.y2) / 2;
  const half = Math.min(DOOR_WIDTH, Math.abs(seg.y2 - seg.y1) * 0.6) / 2;
  return `M ${seg.x1} ${seg.y1} V ${midY - half} M ${seg.x1} ${midY + half} V ${seg.y2}`;
}

function windowPath(seg: Segment): string {
  const isHorizontal = seg.y1 === seg.y2;
  if (isHorizontal) {
    return `M ${seg.x1} ${seg.y1 - WINDOW_OFFSET} L ${seg.x2} ${seg.y1 - WINDOW_OFFSET} M ${seg.x1} ${seg.y1 + WINDOW_OFFSET} L ${seg.x2} ${seg.y1 + WINDOW_OFFSET}`;
  }
  return `M ${seg.x1 - WINDOW_OFFSET} ${seg.y1} L ${seg.x2 - WINDOW_OFFSET} ${seg.y2} M ${seg.x1 + WINDOW_OFFSET} ${seg.y1} L ${seg.x2 + WINDOW_OFFSET} ${seg.y2}`;
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

function BedIcon({
  cx,
  cy,
  roomWidth,
  roomHeight,
}: {
  cx: number;
  cy: number;
  roomWidth: number;
  roomHeight: number;
}) {
  const w = Math.min(130, roomWidth * 0.55);
  const h = Math.min(180, roomHeight * 0.6);
  const x = cx - w / 2;
  const y = cy - h / 2;
  const pillowW = Math.min(40, w * 0.35);
  return (
    <g style={geometryTransition}>
      <rect x={x} y={y} width={w} height={h} rx={4} />
      <line x1={x} y1={y + 18} x2={x + w} y2={y + 18} />
      <rect
        x={x + 10}
        y={y + 8}
        width={pillowW}
        height={20}
        rx={4}
        fill="var(--paper)"
      />
      <rect
        x={x + w - 10 - pillowW}
        y={y + 8}
        width={pillowW}
        height={20}
        rx={4}
        fill="var(--paper)"
      />
    </g>
  );
}

function SofaIcon({
  cx,
  cy,
  roomWidth,
  roomHeight,
}: {
  cx: number;
  cy: number;
  roomWidth: number;
  roomHeight: number;
}) {
  const w = Math.min(120, roomWidth * 0.6);
  const h = Math.min(56, roomHeight * 0.3);
  const x = cx - w / 2;
  const y = cy - h / 2;
  return (
    <g style={geometryTransition}>
      <rect x={x} y={y} width={w} height={h} rx={6} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h * 0.35}
        fill="var(--paper)"
        opacity={0.6}
      />
      <line x1={x + w / 3} y1={y + h * 0.4} x2={x + w / 3} y2={y + h} />
      <line
        x1={x + (2 * w) / 3}
        y1={y + h * 0.4}
        x2={x + (2 * w) / 3}
        y2={y + h}
      />
    </g>
  );
}

function TableIcon({
  cx,
  cy,
  roomWidth,
  roomHeight,
}: {
  cx: number;
  cy: number;
  roomWidth: number;
  roomHeight: number;
}) {
  const size = Math.min(60, roomWidth * 0.3, roomHeight * 0.3);
  const x = cx - size / 2;
  const y = cy - size / 2;
  const chair = 14;
  const gap = 6;
  return (
    <g style={geometryTransition}>
      <rect x={x} y={y} width={size} height={size} rx={3} />
      <rect
        x={cx - chair / 2}
        y={y - gap - chair}
        width={chair}
        height={chair}
        rx={2}
      />
      <rect
        x={cx - chair / 2}
        y={y + size + gap}
        width={chair}
        height={chair}
        rx={2}
      />
      <rect
        x={x - gap - chair}
        y={cy - chair / 2}
        width={chair}
        height={chair}
        rx={2}
      />
      <rect
        x={x + size + gap}
        y={cy - chair / 2}
        width={chair}
        height={chair}
        rx={2}
      />
    </g>
  );
}

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
  const gridPatternId = `${uid}-grid`;

  const roomsPartitionsDashed = layoutChange === "partitions";
  const wetZonesDashed = layoutChange === "wetZones";

  // Дуга открывания входной двери — стандартное обозначение на чертежах,
  // отличает вход от рядового дверного проёма.
  const entranceSwingRadius = layout.entranceDoor.x2 - layout.entranceDoor.x1;
  const entranceSwingPath = `M ${layout.entranceDoor.x1} ${layout.entranceDoor.y1} L ${layout.entranceDoor.x1} ${layout.entranceDoor.y1 - entranceSwingRadius} A ${entranceSwingRadius} ${entranceSwingRadius} 0 0 1 ${layout.entranceDoor.x2} ${layout.entranceDoor.y1}`;

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
    `Квартира площадью ${formatArea(area)}, ${layout.rooms.length} ${roomsWord}, ${layout.bathroomCells.length} ${bathroomsWord}. Входная дверь ведёт в прихожую.`,
    ...layout.rooms.map(
      (room, i) => `Комната ${i + 1}: ${formatArea(room.area)}.`,
    ),
    `Прихожая: ${formatArea(layout.corridorArea)}.`,
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

      <defs>
        <pattern
          id={gridPatternId}
          width={20}
          height={20}
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="var(--grid)"
            strokeWidth={1}
          />
        </pattern>
      </defs>
      <rect
        x={layout.innerX}
        y={layout.innerY}
        width={layout.innerWidth}
        height={layout.innerHeight}
        fill={`url(#${gridPatternId})`}
      />

      <g id="rough" opacity={0.3} fill="var(--grid)">
        {layout.rooms.map((room, i) => (
          <rect
            key={`rough-${i}`}
            x={room.x}
            y={room.y}
            width={room.width}
            height={room.height}
            style={geometryTransition}
          />
        ))}
        <rect
          x={layout.corridorRect.x}
          y={layout.corridorRect.y}
          width={layout.corridorRect.width}
          height={layout.corridorRect.height}
          style={geometryTransition}
        />
      </g>

      <g
        id="finish"
        opacity={0.35}
        stroke="var(--graphite)"
        strokeWidth={1}
        fill="none"
      >
        {layout.rooms.map((room, i) => (
          <rect
            key={`finish-${i}`}
            x={room.x + 8}
            y={room.y + 8}
            width={Math.max(0, room.width - 16)}
            height={Math.max(0, room.height - 16)}
            style={geometryTransition}
          />
        ))}
        <rect
          x={layout.corridorRect.x + 8}
          y={layout.corridorRect.y + 8}
          width={Math.max(0, layout.corridorRect.width - 16)}
          height={Math.max(0, layout.corridorRect.height - 16)}
          style={geometryTransition}
        />
      </g>

      <g id="walls" fill="none" stroke="var(--graphite)">
        <path
          id="wall-perimeter"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          d={`M ${layout.innerX} ${layout.innerY} H ${layout.innerX + layout.innerWidth} V ${layout.innerY + layout.innerHeight} H ${layout.entranceDoor.x2} M ${layout.entranceDoor.x1} ${layout.innerY + layout.innerHeight} H ${layout.innerX} V ${layout.innerY}`}
        />
        <path
          id="wall-entrance-swing"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          d={entranceSwingPath}
        />

        {layout.roomPartitions.map((seg, i) => (
          <path
            key={`wall-room-${i}`}
            id={`wall-room-${i}`}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            d={wallPath(seg, true)}
            strokeDasharray={roomsPartitionsDashed ? "10 6" : undefined}
            style={geometryTransition}
          />
        ))}

        {layout.corridorDoors.map((seg, i) => (
          <path
            key={`wall-corridor-${i}`}
            id={`wall-corridor-${i}`}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            d={wallPath(seg, true)}
            style={geometryTransition}
          />
        ))}

        {layout.bathroomDoors.map((seg, i) => (
          <path
            key={`wall-bathroom-door-${i}`}
            id={`wall-bathroom-door-${i}`}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            d={wallPath(seg, true)}
            strokeDasharray={wetZonesDashed ? "10 6" : undefined}
            style={geometryTransition}
          />
        ))}

        {layout.bathroomCells.slice(0, -1).map((cell, i) => (
          <path
            key={`wall-bathroom-gap-${i}`}
            id={`wall-bathroom-gap-${i}`}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            d={`M ${cell.x + cell.width + GAP / 2} ${cell.y} V ${cell.y + cell.height}`}
            strokeDasharray={wetZonesDashed ? "10 6" : undefined}
            style={geometryTransition}
          />
        ))}

        <g id="windows" stroke="var(--graphite)">
          {layout.windows.map((seg, i) => (
            <path
              key={`window-${i}`}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              d={windowPath(seg)}
            />
          ))}
        </g>
      </g>

      <g id="plumbing" stroke="var(--blueprint)" fill="none" strokeWidth={2}>
        {layout.bathroomCells.map((cell, i) => {
          // Унитаз — реалистичные пропорции (глубже, чем шире), бачок у стены.
          const tankWidth = Math.min(36, cell.width * 0.28);
          const tankHeight = 10;
          const tankX = cell.x + 14;
          const tankY = cell.y + 12;
          const bowlRx = tankWidth / 2 - 3;
          const bowlRy = Math.min(18, cell.height * 0.16);
          const bowlCx = tankX + tankWidth / 2;
          const bowlCy = tankY + tankHeight + bowlRy - 3;

          // Раковина — у противоположной стены.
          const sinkWidth = Math.min(38, cell.width * 0.3);
          const sinkHeight = 22;
          const sinkX = cell.x + cell.width - sinkWidth - 14;
          const sinkY = cell.y + 12;

          return (
            <g key={`plumbing-${i}`} style={geometryTransition}>
              <rect x={tankX} y={tankY} width={tankWidth} height={tankHeight} />
              <ellipse cx={bowlCx} cy={bowlCy} rx={bowlRx} ry={bowlRy} />
              <rect
                x={sinkX}
                y={sinkY}
                width={sinkWidth}
                height={sinkHeight}
                rx={4}
              />
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
          if (i === 0 && room.width > 90 && room.height > 90) {
            return (
              <BedIcon
                key={`furniture-${i}`}
                cx={cx}
                cy={cy}
                roomWidth={room.width}
                roomHeight={room.height}
              />
            );
          }
          if (i === 1 && room.width > 80 && room.height > 60) {
            return (
              <SofaIcon
                key={`furniture-${i}`}
                cx={cx}
                cy={cy}
                roomWidth={room.width}
                roomHeight={room.height}
              />
            );
          }
          if (i >= 2 && room.width > 70 && room.height > 70) {
            return (
              <TableIcon
                key={`furniture-${i}`}
                cx={cx}
                cy={cy}
                roomWidth={room.width}
                roomHeight={room.height}
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

        <text
          x={layout.corridorRect.x + layout.corridorRect.width / 2}
          y={layout.corridorRect.y + layout.corridorRect.height / 2}
          textAnchor="middle"
          fontSize={14}
          stroke="none"
          style={geometryTransition}
        >
          {`Прихожая · ${formatArea(layout.corridorArea)}`}
        </text>
      </g>
    </svg>
  );
}
