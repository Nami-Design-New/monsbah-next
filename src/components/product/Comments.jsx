import { getComments } from "@/services/comments/getComments";
import { getTranslations } from "next-intl/server";
import ClientComments from "./ClientComments";

export default async function Comments({ product }) {
  const t = await getTranslations();
  const comments = await getComments(product?.id);
  return (
    <div className="comments_container">
      <ClientComments comments={comments} product={product} />
    </div>
  );
}
