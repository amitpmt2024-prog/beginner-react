interface Blog {
  id: number;
  title: string;
  author: string;
  body: string;
}

interface BlogListProps {
  blogs: Blog[];
  title: string;
}

const BlogList = ({ blogs, title }: BlogListProps) => {
  return (
    <div>
      <h1>{title}</h1>
      {blogs.map((blog: Blog) => (
        <div className="blog-preview" key={blog.id}>
          <h2>{blog.title}</h2>
          <p>Written by {blog.author}</p>
          {/* <button onClick={() => handleDelete(blog.id)}>Delete Blog</button> */}
        </div>
      ))}
    </div>
  );
};

export default BlogList;