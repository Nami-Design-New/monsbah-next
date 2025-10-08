import BlogCard from "@/components/shared/cards/BlogCard";
import { getBlogs } from "@/services/blogs/getBlogs";
import { getTranslations } from "next-intl/server";

export default async function BlogsList() {
  const t = await getTranslations("blogs");
  const blogs = await getBlogs();
  console.log("blogs", blogs);
  
  return (
    <section className="blogs_section">
      <div className="container">
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>

        <div className="row">
          {blogs?.map((blog) => (
            <div className="col-lg-4 col-md-6 col-12 p-2" key={blog?.id}>
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
