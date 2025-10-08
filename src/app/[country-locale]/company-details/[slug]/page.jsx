import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { cache } from "react";
import { getCompanyProfile } from "@/services/companies/getCompanyProfile";
import { getCompanyProducts } from "@/services/companies/getCompanyProducts";
import CompanyImageProfile from "@/components/companies/CompanyImageProfile";
import CompanyProfileContent from "@/components/companies/CompanyProfileContent";
import CompanyCategoriesSlider from "@/components/companies/CompanyCategoriesSlider";
import ProductVertical from "@/components/shared/cards/ProductVertical";
import { generateHreflangAlternates } from "@/utils/hreflang";

export const fetchCompany = cache(async (id) => {
  return await getCompanyProfile(id);
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const profile = await fetchCompany(Number(slug));
  const t = await getTranslations("meta");

  const pathname = `/company-details/${slug}`;
  const alternates = await generateHreflangAlternates(pathname);

  return {
    title: `${profile?.client?.name} | ${t("companyProfile.titleSuffix")}`,
    description:
      profile?.client?.about?.slice(0, 160) || t("companyProfile.description"),
    alternates,
  };
}

export default async function page({ params, searchParams }) {
  const { slug } = await params;

  const { sub_category } = await searchParams;

  const profile = await fetchCompany(Number(slug));
  const products = await getCompanyProducts({
    id: slug,
    sub_category_id: sub_category,
  });

  return (
    <section className="company_profile_section">
      <div className="banner position-relative">
        <Image fill={true} src="/banner.png" alt="banner" />
      </div>
      <div className="container mt-4 p-0">
        <div className="row">
          <div className="company_header">
            <CompanyImageProfile client={profile?.client} />
            <CompanyProfileContent client={profile?.client} />
          </div>
          <div className="col-12 p-2">
            <div className="about_company">
              <p>{profile?.client?.about}</p>
            </div>
          </div>
          <CompanyCategoriesSlider categories={profile?.client?.categories} />
        </div>
        <div className="row mb-5">
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
