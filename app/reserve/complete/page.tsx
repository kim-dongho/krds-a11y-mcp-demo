import type { Metadata } from "next";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import CompleteSummary from "./CompleteSummary";

export const metadata: Metadata = { title: "예약 완료" };

// SCR-03 예약 완료 — get_page_scaffold(apply-complete) 골격: 완료 메시지(h1) → 신청 정보 → 다음 행동
export default function CompletePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Breadcrumb items={[{ label: "예약 완료", href: "/reserve/complete" }]} />
      <div className="inner narrow">
        <Suspense fallback={<h1 className="comp-msg-wrap">열람실 좌석 예약</h1>}>
          <CompleteSummary />
        </Suspense>
      </div>
    </main>
  );
}
