"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DateInput from "@/components/DateInput";
import {
  ROOMS,
  formatDate,
  operatingHours,
  roomStatus,
  startOfToday,
  validateUseDate,
  type RoomStatus,
} from "@/lib/library";

const BADGE: Record<RoomStatus, string> = {
  여유: "krds-badge bg-light-success",
  혼잡: "krds-badge bg-light-warning",
  마감: "krds-badge bg-light-gray",
};

export default function SeatStatus() {
  const [room, setRoom] = useState("");
  const [date, setDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [applied, setApplied] = useState({ room: "", date: "" });
  const dateRef = useRef<HTMLDivElement>(null);

  // 이용일 기본값은 오늘 — 현재 시각은 브라우저에서만 읽는다(프리렌더 값 고정 방지)
  useEffect(() => {
    const today = formatDate(startOfToday());
    setDate(today); // eslint-disable-line react-hooks/set-state-in-effect -- 브라우저 시각으로 초기화
    setApplied((a) => ({ ...a, date: today }));
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const error = validateUseDate(date);
    setDateError(error);
    if (error) {
      dateRef.current?.querySelector("input")?.focus();
      return;
    }
    setApplied({ room, date: date.trim() });
  }

  const rows = ROOMS.filter((r) => !applied.room || r.id === applied.room);

  return (
    <>
      <form className="txt-box seat-search" role="search" aria-label="좌석 현황 검색" onSubmit={onSubmit} noValidate>
        <div className="seat-search-field">
          <div className="form-group">
            <div className="form-tit"><label htmlFor="room">열람실</label></div>
            <div className="form-conts">
              <select id="room" name="room" className="krds-form-select" value={room} onChange={(e) => setRoom(e.target.value)}>
                <option value="">전체</option>
                {ROOMS.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="seat-search-field" ref={dateRef}>
          <DateInput
            id="use-date"
            label="이용일"
            hint="YYYY.MM.DD 형식으로 입력하거나 달력에서 선택하세요."
            value={date}
            onChange={setDate}
            error={dateError}
          />
        </div>
        <div className="seat-search-action">
          <button type="submit" className="krds-btn large primary">조회</button>
        </div>
      </form>

      <div className="search-list-top">
        <ul className="sch-info" aria-live="polite">
          <li>조회 결과 <span className="point">{rows.length}</span>건</li>
          {applied.date && <li>이용일 {applied.date}</li>}
        </ul>
      </div>

      <div className="krds-table-wrap">
        <table className="tbl col data">
          <caption>열람실별 좌석 현황 — 열람실, 층, 전체 좌석, 잔여 좌석, 운영 시간, 상태, 예약 버튼으로 구성</caption>
          <colgroup>
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">열람실</th>
              <th scope="col">층</th>
              <th scope="col">전체 좌석</th>
              <th scope="col">잔여 좌석</th>
              <th scope="col">운영 시간</th>
              <th scope="col">상태</th>
              <th scope="col">예약</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const status = roomStatus(r);
              const params = new URLSearchParams({ room: r.id });
              if (applied.date) params.set("date", applied.date);
              return (
                <tr key={r.id}>
                  <th scope="row">{r.name}</th>
                  <td>{r.floor}</td>
                  <td>{r.totalSeats}석</td>
                  <td>{r.remainingSeats}석</td>
                  <td>{operatingHours(r)}</td>
                  <td><span className={BADGE[status]}>{status}</span></td>
                  <td>
                    {status === "마감" ? (
                      <button type="button" className="krds-btn medium secondary" disabled>
                        <span className="sr-only">{r.name} </span>예약
                      </button>
                    ) : (
                      <Link href={`/reserve?${params}`} className="krds-btn medium secondary">
                        <span className="sr-only">{r.name} </span>예약
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
