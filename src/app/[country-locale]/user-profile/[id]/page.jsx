import UserImageProfile from "@/components/profile/user-profile/UserImageProfile";
import UserProfileContent from "@/components/profile/user-profile/UserProfileContent";
import ProductVertical from "@/components/shared/cards/ProductVertical";
import { getAllProducts } from "@/services/products/getAllProducts";
import { getUserProfile } from "@/services/profile/getUserProfile";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { cache } from "react";
import { generateHreflangAlternates } from "@/utils/hreflang";

export const fetchUserProfile = cache(async (id) => {
  return await getUserProfile(id);
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const t = await getTranslations("meta");
  const profile = await fetchUserProfile(Number(id));
  const user = profile?.data;

  const pathname = `/user-profile/${id}`;
  const alternates = await generateHreflangAlternates(pathname);

  return {
    title: user?.name
      ? `${user.name} | ${t("userProfile.title")}`
      : t("userProfile.title"),
    description: user?.about
      ? user.about.slice(0, 160)
      : t("userProfile.description"),
    alternates,
  };
}

export default async function page({ params }) {
  const { id } = await params;
  const [profile, products] = await Promise.all([
    fetchUserProfile(Number(id)),
    getAllProducts(Number(id)),
  ]);

  return (
    <section className="company_profile_section">
      {" "}
      <div className="banner position-relative">
        <Image
          fill={true}
          src={profile.cover ? profile.cover : "/banner.png"}
          alt="banner"
        />
      </div>
      <div className="container mt-4 p-0">
        <div className="row">
          <div className="company_header">
            <UserImageProfile client={profile?.data} />
            <UserProfileContent client={profile?.data} />
          </div>
        </div>
        <div className="row my-5">
          {products?.data?.data?.map((product, index) => (
            <div className="col-lg-4 col-md-6 col-12 p-2" key={index}>
              <ProductVertical product={product} isShowAction={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
