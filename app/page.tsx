import { redirect } from "next/navigation";

// 사이트 첫 화면은 좌석 현황 조회(SCR-01)다
export default function Home() {
  redirect("/seats");
}
