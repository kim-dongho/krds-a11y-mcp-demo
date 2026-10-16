"use client";

// 킷 JS(ui-script.js) 연결 — get_framework_guide(nextjs) 처방 1·3.
// 처방 1: 하이드레이션 뒤 1회 로드하고 DOMContentLoaded를 재발행해 init을 트리거한다.
// 처방 3: 라우트 전환 뒤에는 재발행하지 않고 화면 모듈만 다시 init한다(공통 레이아웃 GNB 중복 바인딩 방지).
// 전환 뒤 초점은 본문 시작(main)으로 옮긴다 — 킷 스캐폴드의 SPA 공백.
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const KIT_SCRIPT = "/krds-uiux/resources/js/component/ui-script.js";

// 킷 ui-script.js가 전역 const로 선언한 모듈 — window 속성은 아니지만 이름으로 부를 수 있다
type KitModule = { init(): void };
declare const krds_tab: KitModule;
declare const krds_accordion: KitModule;
declare const krds_modal: KitModule;
declare const krds_disclosure: KitModule;
declare const krds_contextualHelp: KitModule;
declare const krds_tooltip: KitModule;
declare const krds_calendar: KitModule;
declare const krds_tts: KitModule;
declare const krds_fileUpload: KitModule;
declare const krds_toggleSwitch: KitModule;
declare const krds_infoList: KitModule;
declare const krds_chkBox: KitModule;
declare const krds_inPageNavigation: KitModule;
declare const krds_mainMenuPC: { closeMainMenu(): void };

export default function KrdsRuntime() {
  const pathname = usePathname();
  const prev = useRef(pathname);

  useEffect(() => {
    if (document.querySelector("script[data-krds-ui-script]")) return;
    const script = document.createElement("script");
    script.src = KIT_SCRIPT;
    script.dataset.krdsUiScript = "true";
    script.onload = () => {
      window.dispatchEvent(new Event("DOMContentLoaded"));
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    // 첫 화면은 위 재발행이 맡는다. StrictMode가 effect를 두 번 돌려도 경로가 같으면 건너뛴다
    if (prev.current === pathname) return;
    prev.current = pathname;

    document.getElementById("main-content")?.focus();

    if (typeof krds_tab === "undefined") return; // 킷 JS가 아직 안 붙었으면 처방 1이 맡는다
    krds_mainMenuPC.closeMainMenu();
    for (const m of [krds_tab, krds_accordion, krds_modal, krds_disclosure, krds_contextualHelp, krds_tooltip, krds_calendar, krds_tts, krds_fileUpload, krds_toggleSwitch, krds_infoList, krds_chkBox, krds_inPageNavigation]) m.init();
  }, [pathname]);

  return null;
}
