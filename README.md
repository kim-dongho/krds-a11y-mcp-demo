# krds-a11y-mcp demo

[krds-a11y-mcp](https://github.com/kim-dongho/krds-a11y-mcp)로 만든 Next.js 데모. 가상의 도서관 열람실 좌석 예약 서비스이며 실제 기관·서비스가 아니다.

## 만든 방법

1. 빈 Next.js 프로젝트에 `npx -y krds-a11y-mcp init`
2. 화면 흐름 문서 [`docs/screen-flow.md`](docs/screen-flow.md)를 두고 Claude Code에 한 줄로 요청

   ```text
   docs/screen-flow.md의 화면 흐름대로 Next.js로 만들어줘.
   ```

3. AI가 MCP 서버의 KRDS 부품·공통부로 화면을 만들고 `validate_page`로 검사. 필수 입력을 빠뜨린 부품 요청 5번은 거부됐고 값을 채워 다시 받았다. 끝내기 전에는 `gate`로 통과를 확인했다. 위반이 남았다면 Stop 훅이 종료를 막는다

이후 사람이 바꾼 것은 공식 배너 문구와 문서 제목을 데모 표시로 바꾼 것뿐이다.

## 화면

| 경로 | 화면 |
|---|---|
| `/seats` | 좌석 현황 조회 |
| `/reserve` | 좌석 예약 신청 (4단계) |
| `/reserve/complete` | 예약 완료 |
| `/my-reservations` | 내 예약 |
| `/guide` | 이용 안내 |

5개 화면과 상태 화면(달력 열림, 단계별 오류) 모두 자동 검사 위반 0. 자동 검사는 접근성 이슈의 일부만 판정하므로 심사 통과를 뜻하지 않는다.

## 실행

```sh
pnpm install
pnpm dev
```

KRDS 킷 자원은 `predev`·`prebuild`에서 `node_modules/krds-uiux`로부터 `public/krds-uiux`로 복사된다.

## 라이선스

KRDS 킷(krds-uiux)은 공공누리 제1유형이다. 본 저작물은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 '범정부 UI/UX 디자인시스템(KRDS)'을 이용하였으며, 해당 저작물은 'KRDS 디자인시스템 홈페이지(www.krds.go.kr)'에서 무료로 다운받으실 수 있습니다.
