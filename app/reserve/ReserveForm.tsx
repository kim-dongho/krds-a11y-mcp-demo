"use client";

// SCR-02 4단계 신청 — ① 좌석 선택 ② 이용 시간 ③ 이용자 정보 ④ 확인
// 구조는 apply-form 템플릿(page-title-wrap.between + krds-step-wrap → conts-area → page-btn-wrap) 그대로,
// 입력부는 get_component(select·text_input·checkbox·radio_button·table·text_list) 마크업이다.
// 오류: 항목 아래 p.form-hint-invalid + aria-invalid/aria-describedby, 실패 시 첫 오류 항목으로 초점.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DURATIONS,
  ROOMS,
  RULES,
  availableSeats,
  findRoom,
  formatDate,
  formatHour,
  isWindowSeat,
  parseDate,
  roomStatus,
  saveReservation,
  seatLabel,
  startHours,
  startOfToday,
  timeRange,
  type RoomId,
} from "@/lib/library";

const STEPS = ["좌석 선택", "이용 시간", "이용자 정보", "확인"] as const;

type FieldKey = "room" | "seat" | "start" | "duration" | "name" | "memberNo" | "phone" | "sms" | "agree";
type Errors = Partial<Record<FieldKey, string>>;

// 오류 시 초점을 옮길 요소 — 화면 순서대로
const FOCUS_TARGET: Record<FieldKey, string> = {
  room: "room-select",
  seat: "seat",
  start: "start-time",
  duration: "dur-2",
  name: "user-name",
  memberNo: "member-no",
  phone: "user-phone",
  sms: "sms-agree",
  agree: "agree-rules",
};

export default function ReserveForm() {
  const router = useRouter();
  const params = useSearchParams();
  const fixedRoom = findRoom(params.get("room"));
  const roomLocked = !!fixedRoom && roomStatus(fixedRoom) !== "마감";
  const paramDate = params.get("date") ?? "";

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [roomId, setRoomId] = useState<RoomId | "">(roomLocked ? fixedRoom.id : "");
  const [date, setDate] = useState(parseDate(paramDate) ? paramDate : "");
  const [windowOnly, setWindowOnly] = useState(false);
  const [seat, setSeat] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState<string>(String(DURATIONS[0]));
  const [name, setName] = useState("");
  const [memberNo, setMemberNo] = useState("");
  const [phone, setPhone] = useState("");
  const [sms, setSms] = useState(false);
  const [agree, setAgree] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepChanged = useRef(false);

  const room = findRoom(roomId);
  const seats = room ? availableSeats(room).filter((s) => !windowOnly || isWindowSeat(room, s)) : [];

  // 이용일이 쿼리에 없으면 오늘 — 현재 시각은 브라우저에서만 읽는다
  useEffect(() => {
    if (!date) setDate(formatDate(startOfToday())); // eslint-disable-line react-hooks/set-state-in-effect -- 브라우저 시각으로 초기화
  }, [date]);

  // 단계가 바뀌면 단계 제목으로 초점을 옮기고 문서 제목에 현재 단계를 반영한다
  useEffect(() => {
    document.title = `좌석 예약 신청 (${step + 1}/4단계: ${STEPS[step]}) | 시립도서관 (데모)`;
    if (stepChanged.current) headingRef.current?.focus();
  }, [step]);

  function validate(s: number): Errors {
    const e: Errors = {};
    if (s === 0) {
      if (!room) e.room = "예약할 열람실을 선택해 주세요.";
      if (!seat) e.seat = "좌석 번호를 선택해 주세요.";
    }
    if (s === 1 && room) {
      if (!start) e.start = "시작 시각을 선택해 주세요.";
      else if (Number(start) + Number(duration) > room.closeHour)
        e.duration = `운영 종료(${formatHour(room.closeHour)}) 전에 끝나도록 이용 시간을 줄이거나 시작 시각을 앞당겨 주세요.`;
    }
    if (s === 2) {
      if (!name.trim()) e.name = "이름을 입력해 주세요.";
      if (!memberNo.trim()) e.memberNo = "도서관 회원번호를 입력해 주세요.";
      const digits = phone.replace(/-/g, "").trim();
      if (digits && !/^01\d{8,9}$/.test(digits)) e.phone = "휴대전화 번호를 숫자 10~11자리로 입력해 주세요. (예: 01012345678)";
      if (sms && !digits) e.sms = "안내 문자를 받으려면 휴대전화 번호를 입력해 주세요.";
    }
    if (s === 3 && !agree) e.agree = "이용 수칙에 동의해야 예약할 수 있습니다.";
    return e;
  }

  function goNext() {
    const e = validate(step);
    setErrors(e);
    const first = (Object.keys(FOCUS_TARGET) as FieldKey[]).find((k) => e[k]);
    if (first) {
      document.getElementById(FOCUS_TARGET[first])?.focus();
      return;
    }
    if (step < 3) {
      stepChanged.current = true;
      setStep(step + 1);
      return;
    }
    const reservation = saveReservation({
      roomId: room!.id,
      roomName: room!.name,
      date,
      seat: Number(seat),
      window: isWindowSeat(room!, Number(seat)),
      startHour: Number(start),
      duration: Number(duration),
      name: name.trim(),
      memberNo: memberNo.trim(),
      phone: phone.trim(),
      smsAgree: sms,
    });
    router.push(`/reserve/complete?id=${encodeURIComponent(reservation.id)}`);
  }

  function goPrev() {
    setErrors({});
    stepChanged.current = true;
    setStep(step - 1);
  }

  function clearError(key: FieldKey) {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <div className="inner narrow page-step">
      <div className="page-title-wrap between">
        <h1 className="h-tit">좌석 예약 신청</h1>
        <ol className="krds-step-wrap">
          {STEPS.map((title, i) => (
            <li key={title} className={i < step ? "done" : i === step ? "active" : undefined}>
              <span>
                {i === step && <em className="sr-only">현재단계</em>}
                <i className="step">{i + 1}단계</i>
                <span className="step-tit">{title}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="conts-area step-type">
        <div className="conts-wrap">
          <div className="conts-wrap">
            <h2 className="sec-tit" tabIndex={-1} ref={headingRef}>
              <span className="step-now"><strong className="active">{step + 1}단계</strong> / 4단계</span>
              {STEPS[step]}
            </h2>

            <div>
              {step === 0 && (
                <div className="txt-box bg-white">
                  <h3 className="box-tit1">좌석 정보</h3>
                  <div className="box-cnt">
                    <div className="box-sec">
                      {roomLocked ? (
                        <div className="form-group">
                          <div className="form-tit"><label htmlFor="room-name">열람실</label></div>
                          <div className="form-conts">
                            <input type="text" id="room-name" className="krds-input" value={`${room!.name} (${room!.floor})`} readOnly />
                          </div>
                        </div>
                      ) : (
                        <div className="form-group">
                          <div className="form-tit"><label htmlFor="room-select">열람실 (필수)</label></div>
                          <div className={errors.room ? "form-conts is-error" : "form-conts"}>
                            <select
                              id="room-select"
                              name="room"
                              className="krds-form-select"
                              required
                              value={roomId}
                              aria-invalid={errors.room ? true : undefined}
                              aria-describedby={errors.room ? "room-select-error" : undefined}
                              onChange={(e) => {
                                setRoomId(e.target.value as RoomId | "");
                                setSeat("");
                                clearError("room");
                              }}
                            >
                              <option value="">선택</option>
                              {ROOMS.map((r) => (
                                <option key={r.id} value={r.id} disabled={roomStatus(r) === "마감"}>
                                  {r.name}{roomStatus(r) === "마감" ? " (마감)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.room && <p className="form-hint-invalid" id="room-select-error">{errors.room}</p>}
                        </div>
                      )}

                      <div className="form-group">
                        <div className="form-tit"><label htmlFor="use-date-view">이용일</label></div>
                        <div className="form-conts">
                          <input type="text" id="use-date-view" className="krds-input" value={date} readOnly />
                        </div>
                      </div>

                      <div className="krds-form-check">
                        <input
                          type="checkbox"
                          name="window-seat"
                          id="window-seat"
                          value="window"
                          checked={windowOnly}
                          onChange={(e) => {
                            setWindowOnly(e.target.checked);
                            if (e.target.checked && room && seat && !isWindowSeat(room, Number(seat))) setSeat("");
                          }}
                        />
                        <label htmlFor="window-seat">창가석만 보기</label>
                      </div>

                      <div className="form-group">
                        <div className="form-tit"><label htmlFor="seat">좌석 번호 (필수)</label></div>
                        <div className={errors.seat ? "form-conts is-error" : "form-conts"}>
                          <select
                            id="seat"
                            name="seat"
                            className="krds-form-select"
                            required
                            value={seat}
                            disabled={!room}
                            aria-invalid={errors.seat ? true : undefined}
                            aria-describedby={errors.seat ? "seat-hint seat-error" : "seat-hint"}
                            onChange={(e) => {
                              setSeat(e.target.value);
                              clearError("seat");
                            }}
                          >
                            <option value="">선택</option>
                            {room && seats.map((s) => (
                              <option key={s} value={s}>{seatLabel(room, s)}</option>
                            ))}
                          </select>
                        </div>
                        <p className="form-hint" id="seat-hint">
                          {room ? `예약 가능한 좌석 ${seats.length}석 중에서 고르세요.` : "열람실을 먼저 선택하세요."}
                        </p>
                        {errors.seat && <p className="form-hint-invalid" id="seat-error">{errors.seat}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && room && (
                <div className="txt-box bg-white">
                  <h3 className="box-tit1">이용 시간</h3>
                  <div className="box-cnt">
                    <div className="box-sec">
                      <div className="form-group">
                        <div className="form-tit"><label htmlFor="start-time">시작 시각 (필수)</label></div>
                        <div className={errors.start ? "form-conts is-error" : "form-conts"}>
                          <select
                            id="start-time"
                            name="start-time"
                            className="krds-form-select"
                            required
                            value={start}
                            aria-invalid={errors.start ? true : undefined}
                            aria-describedby={errors.start ? "start-time-hint start-time-error" : "start-time-hint"}
                            onChange={(e) => {
                              setStart(e.target.value);
                              clearError("start");
                              clearError("duration");
                            }}
                          >
                            <option value="">선택</option>
                            {startHours(room).map((h) => (
                              <option key={h} value={h}>{formatHour(h)}</option>
                            ))}
                          </select>
                        </div>
                        <p className="form-hint" id="start-time-hint">{room.name} 운영 시간은 {formatHour(room.openHour)}~{formatHour(room.closeHour)}입니다.</p>
                        {errors.start && <p className="form-hint-invalid" id="start-time-error">{errors.start}</p>}
                      </div>

                      <div className="form-group">
                        {/* 화면용 제목 — 킷이 legend를 숨기므로 따로 둔다. 보조기술에는 legend가 읽히니 aria-hidden */}
                        <div className="form-tit" aria-hidden="true">이용 시간 (필수)</div>
                        <fieldset aria-describedby={errors.duration ? "duration-error" : undefined}>
                          <legend>이용 시간 (필수)</legend>
                          <div className="krds-check-area">
                            {DURATIONS.map((d) => (
                              <div className="krds-form-check" key={d}>
                                <input
                                  type="radio"
                                  name="duration"
                                  id={`dur-${d}`}
                                  value={d}
                                  checked={duration === String(d)}
                                  required
                                  onChange={(e) => {
                                    setDuration(e.target.value);
                                    clearError("duration");
                                  }}
                                />
                                <label htmlFor={`dur-${d}`}>{d}시간</label>
                              </div>
                            ))}
                          </div>
                        </fieldset>
                        {errors.duration && <p className="form-hint-invalid" id="duration-error">{errors.duration}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="txt-box bg-white">
                  <h3 className="box-tit1">이용자 정보</h3>
                  <div className="box-cnt">
                    <div className="box-sec">
                      <div className="form-group">
                        <div className="form-tit"><label htmlFor="user-name">이름 (필수)</label></div>
                        <div className={errors.name ? "form-conts is-error" : "form-conts"}>
                          <input
                            type="text"
                            id="user-name"
                            name="user-name"
                            className="krds-input"
                            autoComplete="name"
                            required
                            value={name}
                            aria-invalid={errors.name ? true : undefined}
                            aria-describedby={errors.name ? "user-name-error" : undefined}
                            onChange={(e) => {
                              setName(e.target.value);
                              clearError("name");
                            }}
                          />
                        </div>
                        {errors.name && <p className="form-hint-invalid" id="user-name-error">{errors.name}</p>}
                      </div>

                      <div className="form-group">
                        <div className="form-tit"><label htmlFor="member-no">도서관 회원번호 (필수)</label></div>
                        <div className={errors.memberNo ? "form-conts is-error" : "form-conts"}>
                          <input
                            type="text"
                            id="member-no"
                            name="member-no"
                            className="krds-input"
                            inputMode="numeric"
                            required
                            value={memberNo}
                            aria-invalid={errors.memberNo ? true : undefined}
                            aria-describedby={errors.memberNo ? "member-no-hint member-no-error" : "member-no-hint"}
                            onChange={(e) => {
                              setMemberNo(e.target.value);
                              clearError("memberNo");
                            }}
                          />
                        </div>
                        <p className="form-hint" id="member-no-hint">도서관 회원증에 적힌 번호를 입력하세요.</p>
                        {errors.memberNo && <p className="form-hint-invalid" id="member-no-error">{errors.memberNo}</p>}
                      </div>

                      <div className="form-group">
                        <div className="form-tit"><label htmlFor="user-phone">휴대전화</label></div>
                        <div className={errors.phone ? "form-conts is-error" : "form-conts"}>
                          <input
                            type="text"
                            id="user-phone"
                            name="user-phone"
                            className="krds-input"
                            autoComplete="tel"
                            inputMode="tel"
                            value={phone}
                            aria-invalid={errors.phone ? true : undefined}
                            aria-describedby={errors.phone ? "user-phone-hint user-phone-error" : "user-phone-hint"}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              clearError("phone");
                              clearError("sms");
                            }}
                          />
                        </div>
                        <p className="form-hint" id="user-phone-hint">숫자만 입력 (예: 01012345678)</p>
                        {errors.phone && <p className="form-hint-invalid" id="user-phone-error">{errors.phone}</p>}
                      </div>

                      <div className="form-group">
                        <div className="krds-form-check">
                          <input
                            type="checkbox"
                            name="sms-agree"
                            id="sms-agree"
                            value="sms"
                            checked={sms}
                            aria-invalid={errors.sms ? true : undefined}
                            aria-describedby={errors.sms ? "sms-agree-error" : undefined}
                            onChange={(e) => {
                              setSms(e.target.checked);
                              clearError("sms");
                            }}
                          />
                          <label htmlFor="sms-agree">예약 안내 문자 수신에 동의합니다</label>
                        </div>
                        {errors.sms && <p className="form-hint-invalid" id="sms-agree-error">{errors.sms}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && room && (
                <>
                  <div className="txt-box bg-white">
                    <h3 className="box-tit1">예약 내용</h3>
                    <div className="krds-table-wrap">
                      <table className="tbl col data">
                        <caption>예약 신청 내용 — 열람실, 이용일, 좌석, 이용 시간, 이름, 도서관 회원번호, 휴대전화, 안내 문자 수신으로 구성</caption>
                        <colgroup>
                          <col style={{ width: "30%" }} />
                          <col />
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">항목</th>
                            <th scope="col">내용</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><th scope="row">열람실</th><td>{room.name} ({room.floor})</td></tr>
                          <tr><th scope="row">이용일</th><td>{date}</td></tr>
                          <tr><th scope="row">좌석</th><td>{seatLabel(room, Number(seat))}</td></tr>
                          <tr><th scope="row">이용 시간</th><td>{timeRange(Number(start), Number(duration))}</td></tr>
                          <tr><th scope="row">이름</th><td>{name}</td></tr>
                          <tr><th scope="row">도서관 회원번호</th><td>{memberNo}</td></tr>
                          <tr><th scope="row">휴대전화</th><td>{phone || "입력 안 함"}</td></tr>
                          <tr><th scope="row">안내 문자 수신</th><td>{sms ? "동의" : "동의 안 함"}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="txt-box bg-white">
                    <h3 className="box-tit1">이용 수칙</h3>
                    <ul className="krds-info-list decimal rule-summary" role="list">
                      {RULES.map((rule) => (
                        <li key={rule} role="listitem">{rule}</li>
                      ))}
                    </ul>
                    <div className="form-group">
                      <div className="krds-form-check">
                        <input
                          type="checkbox"
                          name="agree-rules"
                          id="agree-rules"
                          value="rules"
                          required
                          checked={agree}
                          aria-invalid={errors.agree ? true : undefined}
                          aria-describedby={errors.agree ? "agree-rules-error" : undefined}
                          onChange={(e) => {
                            setAgree(e.target.checked);
                            clearError("agree");
                          }}
                        />
                        <label htmlFor="agree-rules">이용 수칙에 동의합니다 (필수)</label>
                      </div>
                      {errors.agree && <p className="form-hint-invalid" id="agree-rules-error">{errors.agree}</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-btn-wrap both m-column">
        {step === 0 ? (
          <Link href="/seats" className="krds-btn xlarge tertiary">좌석 현황으로</Link>
        ) : (
          <button type="button" className="krds-btn xlarge tertiary" onClick={goPrev}>이전으로</button>
        )}
        <div className="btn-wrap">
          <button type="button" className="krds-btn xlarge primary" onClick={goNext}>
            {step === 3 ? "예약하기" : "다음으로"}
          </button>
        </div>
      </div>
    </div>
  );
}
