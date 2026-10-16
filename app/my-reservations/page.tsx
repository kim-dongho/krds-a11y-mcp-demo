import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import ReservationList from "./ReservationList";

export const metadata: Metadata = { title: "내 예약" };

export default function MyReservationsPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Breadcrumb items={[{ label: "내 예약", href: "/my-reservations" }]} />
      <div className="inner">
        <div className="page-title-wrap">
          <h1 className="h-tit">내 예약</h1>
        </div>
        <ReservationList />
      </div>
    </main>
  );
}
