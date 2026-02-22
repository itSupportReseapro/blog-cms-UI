import Link from "next/link";

const links = [
  { href: "/blog/dashboard", label: "Dashboard" },
  { href: "/blog/posts", label: "Posts" },
  { href: "/blog/categories", label: "Categories" },
  { href: "/blog/comments", label: "Comments" },
  { href: "/blog/settings", label: "Settings" },
];

export default function BlogSidebar() {
  return (
    <aside style={{ borderRight: "1px solid #e5e7eb", padding: "20px" }}>
      <h2>Blog CMS</h2>
      <nav style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
