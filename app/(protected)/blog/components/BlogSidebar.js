import Link from "next/link";

const links = [
  { href: "/blog/dashboard", label: "Dashboard" },
  { href: "/blog/activity-log", label: "Activity Log" },
  { href: "/blog/blogs", label: "Blogs" },
  { href: "/blog/privacy-policy", label: "Privacy Policy" },
  { href: "/blog/term-and-condition", label: "Term & Condition" },
  { href: "/blog/user-and-role", label: "User & Role" },
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
