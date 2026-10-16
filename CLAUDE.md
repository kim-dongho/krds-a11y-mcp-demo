<!-- krds-a11y:begin -->
## KRDS + 접근성 (krds-a11y MCP)

- KRDS 페이지·컴포넌트는 직접 마크업하지 않는다 — 페이지는 get_page_scaffold, 부품은 get_component
- 필수 입력(레이블·alt·페이지 제목)은 임의로 채우지 말고 사용자에게 실제 값을 묻는다
- 접근성 검사는 validate_page, 색·배치·폰트 확인은 inspect_page — 자체 검사 스크립트를 만들지 않는다 (훅이 차단한다)
- 킷 원본(node_modules/krds-uiux)을 수정하지 않는다 — 교정은 get_icon_fix_css와 자기 CSS 파일로
- 작업을 끝내기 전에 validate_page로 재검사한다 — 위반이 남으면 Stop 훅이 종료를 차단한다
- 검사 상태는 `npx krds-a11y-mcp gate`로 확인한다 (Claude Code·Codex 공통 — 훅이 같은 판정을 쓴다)
- 세부 규칙은 MCP 연결 시 서버가 자동 전달한다 (이 블록은 MCP 미연결 도구용 보강)
<!-- krds-a11y:end -->
