import type { Metadata } from "next";
import KrdsRuntime from "@/components/KrdsRuntime";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: { template: "%s | 시립도서관 (데모)", default: "시립도서관 열람실 좌석 예약 (데모)" },
  description: "시립도서관 열람실 좌석 현황 조회와 좌석 예약",
};

// 공통부 구조는 get_page_scaffold(withSiteChrome) 조각 순서 그대로 — 화면마다 main#main-content만 다르다
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <head>
        {/* 킷 CSS는 번들 주입 대신 <link>로 — 킷 JS가 외부 CSS 로드를 전제한다 */}
        {/* eslint-disable @next/next/no-css-tags */}
        <link rel="stylesheet" href="/krds-uiux/resources/css/common/common.css" />
        <link rel="stylesheet" href="/krds-uiux/resources/css/component/component.css" />
        <link rel="stylesheet" href="/css/krds-template.css" data-krds-a11y="template" />
        <link rel="stylesheet" href="/css/krds-corrections.css" data-krds-a11y="corrections" />
        <link rel="stylesheet" href="/css/site.css" />
        {/* eslint-enable @next/next/no-css-tags */}
      </head>
      <body>
        <div id="wrap">
          <div id="krds-skip-link">
            <a href="#main-content">본문 바로가기</a>
          </div>

          <section aria-label="데모 안내">
            <div id="krds-masthead">
              <div className="toggle-wrap">
                <div className="toggle-head">
                  <div className="inner">
                    <span className="nuri-txt">KRDS 데모 사이트입니다. 실제 기관·서비스가 아닙니다.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <SiteHeader />

          <div id="container">{children}</div>

          <SiteFooter />
        </div>
        <KrdsRuntime />
      </body>
    </html>
  );
}
