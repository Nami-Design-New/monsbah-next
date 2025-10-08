import { Link } from "@/i18n/navigation";
import { getCategories } from "@/services/categories/getCategories";
import { getTranslations } from "next-intl/server";

import AboutCompany from "./AboutCompany";
import LinksList from "./LinksList";
import DownLoadApp from "./DownLoadApp";
import CopyRights from "./CopyRights";
import { SocialLinks } from "./SocialLinks";

const importantLinks = [
  {
    href: "/about",
    ariaLabel: "About",
    labelKey: "aboutUs",
    iconClass: "fa-sharp fa-light fa-arrow-right",
  },
  {
    href: "/blogs",
    ariaLabel: "Blogs",
    labelKey: "blogs",
    iconClass: "fa-sharp fa-light fa-arrow-right",
  },
  // {
  //   href: "/asks",
  //   ariaLabel: "Asks",
  //   labelKey: "asks",
  //   iconClass: "fa-sharp fa-light fa-arrow-right",
  // },
  {
    href: "/contact",
    ariaLabel: "Contact Us",
    labelKey: "contactUs",
    iconClass: "fa-sharp fa-light fa-arrow-right",
  },
  {
    href: "/terms-and-conditions",
    ariaLabel: "Terms",
    labelKey: "tearmsAndConditions",
    iconClass: "fa-sharp fa-light fa-arrow-right",
  },
];

export default async function Footer() {
  const t = await getTranslations();
  const categories = await getCategories();

  return (
    <footer>
      <div className="container">
        <div className="row m-0">
          <div className="col-lg-4 col-12 p-2">
            <AboutCompany />
          </div>

          <div className="col-lg-3 col-md-6 col-6 p-2">
            <div className="col">
              <h3>{t("importantLinks")}</h3>
              <LinksList navLinks={importantLinks} />
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-6 p-2">
            <div className="col">
              <h3>{t("popularCategories")}</h3>
              <ul>
                {categories?.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/?category=${category?.slug}`}
                      aria-label="Category"
                    >
                      <span>
                        <i className="fa-sharp fa-light fa-arrow-right" />
                      </span>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-2 col-12 p-2">
            <div className="col">
             <DownLoadApp />
            </div>
          </div>

          <div className="col-12 p-2">
            <div className="copy_rights">
              <CopyRights />
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
