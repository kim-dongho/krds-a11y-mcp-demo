"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { findRoom, loadReservations, seatLabel, timeRange, type Reservation } from "@/lib/library";

const noop = () => () => {};
const PENDING = "pending";

// 이 데모의 예약은 이 브라우저 탭(sessionStorage)에만 저장된다
export default function ReservationList() {
  const snapshot = useSyncExternalStore(noop, () => JSON.stringify(loadReservations()), () => PENDING);
  if (snapshot === PENDING) return null;

  const list = JSON.parse(snapshot) as Reservation[];
  if (!list.length) {
    return (
      <div className="txt-box">
        <p>예약 내역이 없습니다.</p>
        <div className="page-btn-wrap">
          <Link href="/seats" className="krds-btn xlarge primary">좌석 현황 조회</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="krds-table-wrap">
      <table className="tbl col data">
        <caption>내 예약 목록 — 예약번호, 열람실, 좌석, 이용일, 이용 시간으로 구성</caption>
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">예약번호</th>
            <th scope="col">열람실</th>
            <th scope="col">좌석</th>
            <th scope="col">이용일</th>
            <th scope="col">이용 시간</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => {
            const room = findRoom(r.roomId);
            return (
              <tr key={r.id}>
                <th scope="row">{r.id}</th>
                <td>{r.roomName}</td>
                <td>{room ? seatLabel(room, r.seat) : `${r.seat}번`}</td>
                <td>{r.date}</td>
                <td>{timeRange(r.startHour, r.duration)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
