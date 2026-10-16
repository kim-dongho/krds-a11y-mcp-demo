import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { ROOMS, RULES, operatingHours } from "@/lib/library";

export const metadata: Metadata = { title: "이용 안내" };

export default function GuidePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Breadcrumb items={[{ label: "이용 안내", href: "/guide" }]} />
      <div className="inner">
        <div className="page-title-wrap">
          <h1 className="h-tit">이용 안내</h1>
        </div>

        <section className="page-section" aria-labelledby="guide-rooms">
          <h2 id="guide-rooms">열람실 운영 시간</h2>
          <div className="krds-table-wrap">
            <table className="tbl col data">
              <caption>열람실별 위치와 운영 시간 — 열람실, 층, 좌석 수, 운영 시간으로 구성</caption>
              <colgroup>
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">열람실</th>
                  <th scope="col">층</th>
                  <th scope="col">좌석 수</th>
                  <th scope="col">운영 시간</th>
                </tr>
              </thead>
              <tbody>
                {ROOMS.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">{r.name}</th>
                    <td>{r.floor}</td>
                    <td>{r.totalSeats}석</td>
                    <td>{operatingHours(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="page-section" aria-labelledby="guide-rules">
          <h2 id="guide-rules">이용 수칙</h2>
          {/* role은 킷 krds_infoList가 붙이는 값 그대로 — 미리 렌더해 하이드레이션 전 DOM 변형과 어긋나지 않게 한다 */}
          <ul className="krds-info-list decimal" role="list">
            {RULES.map((rule) => (
              <li key={rule} role="listitem">{rule}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
