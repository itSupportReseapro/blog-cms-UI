export default async function EditPostPage({ params }) {
  const { id } = await params;

  return (
    <section>
      <h1>Edit Post</h1>
      <p>Editing post ID: {id}</p>
    </section>
  );
}
