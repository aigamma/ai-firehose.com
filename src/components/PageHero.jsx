/*
  The masthead for an interior reading page (Methodology, About, the Harness demo).
  A mono eyebrow over a strong title and an editorial serif standfirst, modeled on
  worldthought.com's room pages. It lives inside a centered .article column (see
  theme.css), which is the fix for the old left-pinned interior pages: they capped
  their width but never centered, so the column hugged the left of the wide shell.
*/
export default function PageHero({ eyebrow, title, lede }) {
  return (
    <header className="article-hero">
      {eyebrow && <p className="article-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {lede && <p className="article-lede">{lede}</p>}
    </header>
  );
}
