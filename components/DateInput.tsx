"use client";

// 날짜 입력 필드 — get_component(date_input) 킷 구조를 React가 소유한다.
// 킷 JS의 달력 동작은 고정 데모 달(2024년 12월)을 다루는 테스트 코드라(example()) 실제 날짜를 그릴 수 없다.
// 그래서 달력 영역(.krds-calendar-area)은 열렸을 때만 렌더해 킷 init이 건너뛰게 두고,
// 달 이동·caption 동기화·선택·초점 트랩·Esc 닫기를 여기서 구현한다.
// 교정: 킷 입력의 type="number"는 YYYY.MM.DD 형식과 모순이라 type="text" + inputMode로 바꿨다.
import { useEffect, useId, useRef, useState } from "react";
import { formatDate, parseDate, startOfToday } from "@/lib/library";

type Props = {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

type Cell = { date: Date; kind: "old" | "cur" | "new" };

function monthCells(year: number, month: number): Cell[][] {
  const first = new Date(year, month - 1, 1);
  const start = new Date(year, month - 1, 1 - first.getDay());
  const last = new Date(year, month, 0);
  const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
  const rows: Cell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const row: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
      const kind = date.getMonth() === month - 1 ? "cur" : date < first ? "old" : "new";
      row.push({ date, kind });
    }
    rows.push(row);
  }
  return rows;
}

function sameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getTime() === b.getTime();
}

export default function DateInput({ id, label, hint, value, onChange, error }: Props) {
  // 오늘은 달력을 열 때 정한다 — 렌더(프리렌더) 중에 현재 시각을 읽지 않는다
  const [today, setToday] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: 0, month: 0 });
  const [picked, setPicked] = useState<Date | null>(null);
  const [selector, setSelector] = useState<"year" | "month" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const yearListId = useId();
  const monthListId = useId();

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  function openCalendar() {
    const now = startOfToday();
    const current = parseDate(value);
    const base = current && current >= now ? current : now;
    setToday(now);
    setPicked(current);
    setView({ year: base.getFullYear(), month: base.getMonth() + 1 });
    setSelector(null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setSelector(null);
    triggerRef.current?.focus();
  }

  function moveMonth(delta: number) {
    const d = new Date(view.year, view.month - 1 + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  function confirm() {
    if (picked) onChange(formatDate(picked));
    close();
  }

  // 열리면 킷과 같이 달력 영역으로 초점을 옮긴다
  useEffect(() => {
    if (open) wrapRef.current?.focus();
  }, [open]);

  // 바깥 클릭 시 닫기 (킷 setupGlobalListeners와 같은 동작)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSelector(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (selector) setSelector(null);
      else close();
      return;
    }
    if (e.key !== "Tab" || !wrapRef.current) return;
    // 초점 트랩 — 달력이 열려 있는 동안 Tab이 달력 안에서 순환한다
    const focusables = Array.from(
      wrapRef.current.querySelectorAll<HTMLElement>("button:not([disabled])"),
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === wrapRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="form-group">
      <div className="form-tit">
        <label htmlFor={id}>{label}</label>
      </div>
      <div className={error ? "form-conts is-error" : "form-conts"}>
        <div className="form-conts calendar-conts" ref={containerRef}>
          <div className="calendar-input">
            <input
              type="text"
              inputMode="numeric"
              className="krds-input datepicker cal"
              placeholder="YYYY.MM.DD"
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${hintId} ${errorId}` : hintId}
            />
            <button
              type="button"
              className="krds-btn medium icon form-btn-datepicker"
              ref={triggerRef}
              aria-expanded={open}
              onClick={() => (open ? close() : openCalendar())}
            >
              <span className="sr-only">달력 열기</span>
              <i className="svg-icon ico-calendar"></i>
            </button>
          </div>
          {open && today && renderCalendar(today)}
        </div>
      </div>
      <p className="form-hint" id={hintId}>{hint}</p>
      {error && <p className="form-hint-invalid" id={errorId}>{error}</p>}
    </div>
  );

  function renderCalendar(today: Date) {
    const years = [today.getFullYear(), today.getFullYear() + 1];
    const rows = monthCells(view.year, view.month);
    const prevDisabled = new Date(view.year, view.month - 1, 1) <= new Date(today.getFullYear(), today.getMonth(), 1);
    const nextDisabled = view.year === years[years.length - 1] && view.month === 12;

    return (
      <div className="krds-calendar-area active">
        <div
          className="calendar-wrap"
          role="dialog"
          aria-label={`${label} 선택 달력`}
          tabIndex={0}
          ref={wrapRef}
          onKeyDown={onKeyDown}
        >
          <div className="calendar-head">
            <button type="button" className="btn-cal-move prev" disabled={prevDisabled} onClick={() => moveMonth(-1)}>
              <span className="sr-only">이전 달</span>
            </button>
            <div className="calendar-switch-wrap">
              <div className="calendar-drop-down">
                <button
                  type="button"
                  className={selector === "year" ? "btn-cal-switch year active" : "btn-cal-switch year"}
                  aria-label="연도 선택"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-expanded={selector === "year"}
                  aria-controls={yearListId}
                  onClick={() => setSelector(selector === "year" ? null : "year")}
                >
                  {view.year}년
                </button>
                <div className={selector === "year" ? "calendar-select calendar-year-wrap active" : "calendar-select calendar-year-wrap"}>
                  <ul className="sel year" role="listbox" id={yearListId}>
                    {years.map((y) => (
                      <li key={y} role="none">
                        <button
                          type="button"
                          role="option"
                          aria-selected={y === view.year}
                          className={y === view.year ? "active" : undefined}
                          onClick={() => {
                            const month = y === today.getFullYear() ? Math.max(view.month, today.getMonth() + 1) : view.month;
                            setView({ year: y, month });
                            setSelector(null);
                          }}
                        >
                          {y}년
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="calendar-drop-down">
                <button
                  type="button"
                  className={selector === "month" ? "btn-cal-switch month active" : "btn-cal-switch month"}
                  aria-label="월 선택"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-expanded={selector === "month"}
                  aria-controls={monthListId}
                  onClick={() => setSelector(selector === "month" ? null : "month")}
                >
                  {String(view.month).padStart(2, "0")}월
                </button>
                <div className={selector === "month" ? "calendar-select calendar-mon-wrap active" : "calendar-select calendar-mon-wrap"}>
                  <ul className="sel month" role="listbox" id={monthListId}>
                    {MONTHS.map((m) => (
                      <li key={m} role="none">
                        <button
                          type="button"
                          role="option"
                          aria-selected={m === view.month}
                          className={m === view.month ? "active" : undefined}
                          disabled={view.year === today.getFullYear() && m < today.getMonth() + 1}
                          onClick={() => {
                            setView({ year: view.year, month: m });
                            setSelector(null);
                          }}
                        >
                          {String(m).padStart(2, "0")}월
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <button type="button" className="btn-cal-move next" disabled={nextDisabled} onClick={() => moveMonth(1)}>
              <span className="sr-only">다음 달</span>
            </button>
          </div>
          <div className="calendar-body">
            <div className="calendar-table-wrap">
              <table className="calendar-tbl">
                <caption>
                  {view.year}년 {view.month}월
                </caption>
                <thead>
                  <tr>
                    {WEEKDAYS.map((w) => (
                      <th key={w} scope="col">{w}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map(({ date, kind }) => {
                        const past = date < today;
                        const isToday = sameDay(date, today);
                        const isPicked = sameDay(date, picked);
                        const cls = [
                          kind !== "cur" ? kind : null,
                          kind === "cur" && past ? "disabled" : null,
                          isToday ? "today" : null,
                          isPicked ? "period start end" : null,
                        ].filter(Boolean).join(" ");
                        const name = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일${isToday ? " 오늘" : ""}`;
                        return (
                          <td key={date.getTime()} className={cls || undefined}>
                            <button
                              type="button"
                              className="btn-set-date"
                              aria-label={name}
                              aria-pressed={isPicked ? true : undefined}
                              disabled={kind !== "cur" || past}
                              onClick={() => setPicked(date)}
                            >
                              <span>{date.getDate()}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="calendar-footer">
            <div className="calendar-btn-wrap">
              <button
                type="button"
                className="krds-btn small text"
                id="get-today"
                onClick={() => {
                  setPicked(today);
                  setView({ year: today.getFullYear(), month: today.getMonth() + 1 });
                }}
              >
                오늘
              </button>
              <button type="button" className="krds-btn small tertiary" onClick={close}>취소</button>
              <button type="button" className="krds-btn small primary" onClick={confirm}>확인</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
