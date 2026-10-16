// 킷 CSS·JS·폰트·이미지를 public/krds-uiux로 복사한다 — 킷은 <link>/<script>로 로드해야 한다(번들 주입 금지).
// 킷 원본(node_modules/krds-uiux)은 수정하지 않는다.
import { cpSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const kitRoot = dirname(require.resolve("krds-uiux/package.json"));
const dest = join(process.cwd(), "public", "krds-uiux", "resources");

rmSync(dest, { recursive: true, force: true });
for (const dir of ["css", "js", "fonts", "img"]) {
  cpSync(join(kitRoot, "resources", dir), join(dest, dir), { recursive: true });
}
console.log(`krds-uiux assets → ${dest}`);
