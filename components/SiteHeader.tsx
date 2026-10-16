"use client";

// 사이트 공통 헤더 — get_page_scaffold(withSiteChrome, siteMenu) 조립분을 그대로 옮겼다.
// GNB 내부 이동은 next/link, 현재 위치는 라우터 기준 aria-current로 표시한다.
// 모바일 전체메뉴의 링크는 킷 JS가 여닫기·초점 트랩을 소유하므로 일반 <a>(전체 로드)로 둔다.
import Link from "next/link";
import { usePathname } from "next/navigation";

function current(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined;
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header id="krds-header">
      <div className="header-in">
        <div className="header-container">
          <div className="inner">
            <div className="header-branding">
              <h2 className="logo">
                <Link href="/"><span className="sr-only">시립도서관</span></Link>
              </h2>
              <div className="header-actions">
                <button type="button" className="btn-navi all" aria-controls="mobile-nav">전체메뉴</button>
              </div>
            </div>
          </div>
        </div>
        <nav className="krds-main-menu" aria-label="메인 메뉴">
          <div className="inner">
            <ul className="gnb-menu">
              <li>
                <button type="button" className="gnb-main-trigger" data-trigger="gnb">좌석 예약</button>
                <div className="gnb-toggle-wrap">
                  <div className="gnb-main-list">
                    <div className="gnb-sub-list single-list">
                      <div className="gnb-sub-content">
                        <h2 className="sub-title"><span>좌석 예약</span></h2>
                        <ul>
                          <li><Link href="/seats" aria-current={current(pathname, "/seats")}>좌석 현황</Link></li>
                          <li><Link href="/reserve" aria-current={current(pathname, "/reserve")}>예약 신청</Link></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li><Link href="/my-reservations" className="gnb-main-trigger is-link" data-trigger="gnb" aria-current={current(pathname, "/my-reservations")}>내 예약</Link></li>
              <li><Link href="/guide" className="gnb-main-trigger is-link" data-trigger="gnb" aria-current={current(pathname, "/guide")}>이용 안내</Link></li>
            </ul>
          </div>
        </nav>
      </div>
      <div id="mobile-nav" className="krds-main-menu-mobile">
        <div className="gnb-wrap">
          <div className="gnb-body">
            <div className="gnb-menu">
              <div className="menu-wrap">
                <ul>
                  <li><a href="#mGnb-anchor1" className="gnb-main-trigger">좌석 예약</a></li>
                  <li><a href="#mGnb-anchor2" className="gnb-main-trigger">내 예약</a></li>
                  <li><a href="#mGnb-anchor3" className="gnb-main-trigger">이용 안내</a></li>
                </ul>
              </div>
              <div className="submenu-wrap">
                <div className="gnb-sub-list" id="mGnb-anchor1">
                  <h2 className="sub-title">좌석 예약</h2>
                  <ul>
                    <li><a href="/seats" className="gnb-sub-trigger" aria-current={current(pathname, "/seats")}>좌석 현황</a></li>
                    <li><a href="/reserve" className="gnb-sub-trigger" aria-current={current(pathname, "/reserve")}>예약 신청</a></li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor2">
                  <h2 className="sub-title">내 예약</h2>
                  <ul>
                    <li><a href="/my-reservations" className="gnb-sub-trigger" aria-current={current(pathname, "/my-reservations")}>내 예약</a></li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor3">
                  <h2 className="sub-title">이용 안내</h2>
                  <ul>
                    <li><a href="/guide" className="gnb-sub-trigger" aria-current={current(pathname, "/guide")}>이용 안내</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <button type="button" className="krds-btn medium icon" id="close-nav">
            <span className="sr-only">전체메뉴 닫기</span>
            <i className="svg-icon ico-popup-close"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
