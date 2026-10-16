"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { findReservation, findRoom, seatLabel, timeRange, type Reservation } from "@/lib/library";

const noop = () => () => {};
const PENDING = "pending";

export default function CompleteSummary() {
  const id = useSearchParams().get("id") ?? "";
  // 예약은 브라우저 저장소에 있다 — 서버 렌더에서는 "확인 중"으로 두고 브라우저에서 읽는다
  // 스냅샷은 값 비교가 되도록 JSON 문자열로 받는다
  const snapshot = useSyncExternalStore(noop, () => JSON.stringify(findReservation(id) ?? null), () => PENDING);

  if (snapshot === PENDING) {
    return <h1 className="comp-msg-wrap">열람실 좌석 예약</h1>;
  }

  const reservation = JSON.parse(snapshot) as Reservation | null;
  if (!reservation) {
    return (
      <>
        <h1 className="comp-msg-wrap">예약 내역을 찾을 수 없습니다.</h1>
        <div className="comp-btn-wrap">
          <Link href="/seats" className="krds-btn xlarge primary">좌석 현황 조회</Link>
        </div>
      </>
    );
  }

  const room = findRoom(reservation.roomId);

  return (
    <>
      <h1 className="comp-msg-wrap">
        열람실 좌석 예약<br />
        신청이 <span className="point">완료</span>되었습니다.
      </h1>

      <ul className="comp-info-box">
        <li>
          <div className="key">예약번호</div>
          <div className="value">{reservation.id}</div>
        </li>
        <li>
          <div className="key">열람실</div>
          <div className="value">{reservation.roomName}</div>
        </li>
        <li>
          <div className="key">좌석</div>
          <div className="value">{room ? seatLabel(room, reservation.seat) : `${reservation.seat}번`}</div>
        </li>
        <li>
          <div className="key">이용 일시</div>
          <div className="value">{reservation.date} {timeRange(reservation.startHour, reservation.duration)}</div>
        </li>
      </ul>

      <div className="comp-btn-wrap">
        <Link href="/seats" className="krds-btn xlarge tertiary">처음으로</Link>
        <Link href="/my-reservations" className="krds-btn xlarge primary">내 예약 보기</Link>
      </div>
    </>
  );
}
