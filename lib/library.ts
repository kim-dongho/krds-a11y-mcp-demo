// 열람실·좌석 예시 데이터와 예약 저장 — 백엔드 없이 동작하는 데모용 (docs/screen-flow.md)

export type RoomId = "room1" | "room2" | "laptop";
export type RoomStatus = "여유" | "혼잡" | "마감";

export type Room = {
  id: RoomId;
  name: string;
  floor: string;
  totalSeats: number;
  remainingSeats: number;
  openHour: number;
  closeHour: number;
  windowSeats: number[];
};

export const ROOMS: Room[] = [
  { id: "room1", name: "제1열람실", floor: "2층", totalSeats: 120, remainingSeats: 34, openHour: 9, closeHour: 22, windowSeats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { id: "room2", name: "제2열람실", floor: "3층", totalSeats: 80, remainingSeats: 6, openHour: 9, closeHour: 22, windowSeats: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: "laptop", name: "노트북열람실", floor: "3층", totalSeats: 40, remainingSeats: 0, openHour: 9, closeHour: 18, windowSeats: [1, 2, 3, 4] },
];

export const DURATIONS = [2, 3, 4] as const;

export function findRoom(id: string | null | undefined): Room | undefined {
  return ROOMS.find((room) => room.id === id);
}

export function roomStatus(room: Room): RoomStatus {
  if (room.remainingSeats === 0) return "마감";
  return room.remainingSeats / room.totalSeats < 0.1 ? "혼잡" : "여유";
}

export function operatingHours(room: Room): string {
  return `${pad(room.openHour)}:00~${pad(room.closeHour)}:00`;
}

/** 잔여 좌석 번호 — 예시 데이터라 잔여 수만큼 고르게 흩어 뽑는다 */
export function availableSeats(room: Room): number[] {
  const seats: number[] = [];
  if (room.remainingSeats === 0) return seats;
  const step = room.totalSeats / room.remainingSeats;
  for (let i = 0; i < room.remainingSeats; i++) seats.push(Math.floor(i * step) + 1);
  return seats;
}

export function isWindowSeat(room: Room, seat: number): boolean {
  return room.windowSeats.includes(seat);
}

export function seatLabel(room: Room, seat: number): string {
  return `${seat}번${isWindowSeat(room, seat) ? " (창가석)" : ""}`;
}

/** 시작 가능 시각 — 최소 이용 시간(2시간)이 운영 종료 전에 끝나야 한다 */
export function startHours(room: Room): number[] {
  const hours: number[] = [];
  for (let h = room.openHour; h + DURATIONS[0] <= room.closeHour; h++) hours.push(h);
  return hours;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatHour(h: number): string {
  return `${pad(h)}:00`;
}

export function timeRange(start: number, duration: number): string {
  return `${formatHour(start)}~${formatHour(start + duration)} (${duration}시간)`;
}

// ---- 날짜 (YYYY.MM.DD) ----

export function formatDate(d: Date): string {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function parseDate(value: string): Date | null {
  const m = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (d.getMonth() !== Number(m[2]) - 1) return null;
  return d;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** 이용일 검사 — 오류 문구 또는 null */
export function validateUseDate(value: string): string | null {
  if (!value.trim()) return "이용일을 입력해 주세요.";
  const d = parseDate(value);
  if (!d) return "이용일을 YYYY.MM.DD 형식으로 입력해 주세요. (예: 2026.10.16)";
  if (d < startOfToday()) return "지난 날짜는 조회할 수 없습니다. 오늘 이후 날짜를 입력해 주세요.";
  return null;
}

// ---- 예약 (브라우저 sessionStorage) ----

export type Reservation = {
  id: string;
  roomId: RoomId;
  roomName: string;
  date: string;
  seat: number;
  window: boolean;
  startHour: number;
  duration: number;
  name: string;
  memberNo: string;
  phone: string;
  smsAgree: boolean;
};

const STORAGE_KEY = "library-seat:reservations";
// 저장소를 못 쓰는 환경에서도 같은 탭의 클라이언트 이동(완료 화면)까지는 이어지게 메모리에도 둔다
let memory: Reservation[] = [];

export function loadReservations(): Reservation[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Reservation[]) : memory;
  } catch {
    return memory;
  }
}

export function saveReservation(r: Omit<Reservation, "id">): Reservation {
  const list = loadReservations();
  const year = new Date().getFullYear();
  const id = `LIB-${year}-${pad(412 + list.length).padStart(4, "0")}`;
  const reservation = { ...r, id };
  memory = [...list, reservation];
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // 저장소를 쓸 수 없으면(사생활 보호 모드 등) 메모리 사본만 남는다
  }
  return reservation;
}

export function findReservation(id: string): Reservation | undefined {
  return loadReservations().find((r) => r.id === id);
}

// ---- 이용 수칙 (예시 문구 — 실제 도서관 규정으로 교체) ----

export const RULES = [
  "예약한 시작 시각부터 30분 안에 입실하지 않으면 예약이 자동 취소됩니다.",
  "하루에 한 번, 최대 4시간까지 예약할 수 있습니다.",
  "예약한 좌석만 이용할 수 있으며 다른 사람에게 양도할 수 없습니다.",
  "열람실에서는 통화와 대화를 삼가 주세요. 노트북은 노트북열람실에서만 사용할 수 있습니다.",
];
