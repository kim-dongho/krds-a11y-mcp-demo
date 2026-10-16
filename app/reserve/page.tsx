import type { Metadata } from "next";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import ReserveForm from "./ReserveForm";

export const metadata: Metadata = { title: "좌석 예약 신청" };

// SCR-02 좌석 예약 신청 — get_page_scaffold(apply-form) 단계형 골격.
// 쿼리(room·date)는 요청 시점에만 알 수 있어 폼을 Suspense 안에 둔다.
export default function ReservePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Breadcrumb items={[{ label: "좌석 예약 신청", href: "/reserve" }]} />
      <Suspense
        fallback={
          <div className="inner narrow page-step">
            <div className="page-title-wrap between">
              <h1 className="h-tit">좌석 예약 신청</h1>
            </div>
          </div>
        }
      >
        <ReserveForm />
      </Suspense>
    </main>
  );
}
