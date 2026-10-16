// 현재 경로 — 킷 breadcrumb 정식 마크업(패턴 템플릿 교정본: 현재 항목 aria-current="page")
import Link from "next/link";

export type Crumb = { label: string; href: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="krds-breadcrumb-wrap" aria-label="현재 경로">
      <ol className="breadcrumb">
        <li className="home"><Link href="/" className="txt">홈</Link></li>
        {items.map((item, i) => (
          <li key={item.href}>
            <Link href={item.href} className="txt" aria-current={i === items.length - 1 ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
