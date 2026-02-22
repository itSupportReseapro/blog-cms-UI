import BlogHeader from "./components/BlogHeader";
import BlogSidebar from "./components/BlogSidebar";

export default function BlogLayout({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <BlogSidebar />
      <div>
        <BlogHeader />
        <main style={{ padding: "24px" }}>{children}</main>
      </div>
    </div>
  );
}
