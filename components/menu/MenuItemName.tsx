/* ── Component: MenuItemName ──────────────────────────────────────────── */
export default function MenuItemName({ item, bengaliFirst = false }: {
  item: { name: string; nameBn?: string; code?: string }; bengaliFirst?: boolean;
}) {
  const bn = item.nameBn?.trim();
  return <span className="menu-item-names">
    {item.code && <small className="item-code-label">কোড: {item.code}</small>}
    <strong lang={bengaliFirst && bn ? "bn" : "en"}>{bengaliFirst && bn ? bn : item.name}</strong>
    {bn && (bengaliFirst ? <small lang="en">{item.name}</small> : <span className="menu-name-bn" lang="bn">{bn}</span>)}
  </span>;
}
