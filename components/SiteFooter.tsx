// 사이트 공통 푸터 — get_page_scaffold(withSiteChrome) 조립분.
// 기관 정보는 데모용 예시값이다(실제 값으로 교체할 것). 대상 화면이 없는 관련 사이트(foot-quick)·SNS·정책 링크는 뺐다.
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="krds-footer">
      <div className="inner">
        <div className="f-logo">
          <span className="sr-only">시립도서관</span>
        </div>
        <div className="f-cnt">
          <div className="f-info">
            <p className="info-addr">(00000) 예시시 예시구 도서관로 1 시립도서관 (예시 주소)</p>
            <ul className="info-cs">
              <li><strong className="strong">대표전화 000-000-0000 (예시)</strong><span className="span">(평일 09시~18시)</span></li>
            </ul>
          </div>

          <div className="f-link">
            <div className="link-go">
              <Link href="/guide" className="krds-btn medium text">이용 안내 <i className="svg-icon ico-angle right"></i></Link>
            </div>
          </div>
        </div>

        <div className="f-btm">
          <div className="f-btm-text">
            <p className="f-copy">© 2026 시립도서관 (예시). All rights reserved.</p>
          </div>
          <div className="krds-identifier">
            <span className="logo">
              <span className="sr-only">시립도서관</span>
            </span>
            <span className="ban-txt">이 누리집은 시립도서관 누리집입니다. (예시)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
