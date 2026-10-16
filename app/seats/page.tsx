import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import SeatStatus from "./SeatStatus";

export const metadata: Metadata = { title: "좌석 현황 조회" };

// SCR-01 좌석 현황 조회 — get_page_scaffold(apply-list) 골격: 브레드크럼 → 제목 → 검색 → 결과 상단 → 목록
export default function SeatsPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Breadcrumb items={[{ label: "좌석 현황 조회", href: "/seats" }]} />
      <div className="inner">
        <div className="page-title-wrap">
          <h1 className="h-tit">좌석 현황 조회</h1>
        </div>
        <SeatStatus />
      </div>
    </main>
  );
}
