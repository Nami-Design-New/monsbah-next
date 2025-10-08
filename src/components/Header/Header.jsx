"use client";

import { Link } from "@/i18n/navigation";
import { useAuthModal } from "@/stores/useAuthModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslations } from "next-intl";
import Image from "next/image";
import MoreActions from "./MoreActions";
import NavLinks from "./NavLinks";
import NotificationsDropDown from "./NotificationsDropDown";
import LanguageSwitcher from "./LanguageSwitcher";
import { Dropdown } from "react-bootstrap";
import LogoutComponent from "../profile/LogoutComponent";

export default function Header() {
  const t = useTranslations();
  const handleShowAuthModal = useAuthModal((state) => state.onOpen);
  const user = useAuthStore((state) => state.user);
  const { userType } = useAuthModal((state) => state);

  return (
    <header>
      <div className="container">
        <div className="mainLinks">
          <Link aria-label="Home" href="/" className="navbar-brand">
            <Image
              src="/branding/icon.svg"
              width={40}
              height={40}
              alt="Navbar icon"
            />
          </Link>

          <NavLinks />

          <div className="moreActions">
            <MoreActions />

            {user && (
              <>
                <NotificationsDropDown />
              </>
            )}

            <LanguageSwitcher />

            <Link aria-label="Search" href="/search" className="link">
              <Image src="/icons/search.svg" width={16} height={16} alt="" />
            </Link>

            {user && userType ? (
              <>
                {userType === "client" ? (
                  <>
                    <Link
                      aria-label="Profile"
                      href="/profile"
                      className="link profile-link  position-relative"
                    >
                      <Image fill={true} src={user?.image} alt="user" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Dropdown>
                      <Dropdown.Toggle
                        aria-label="user icon"
                        id="dropdown-basic"
                        className="link profile-link position-relative"
                      >
                        <Image
                          fill={true}
                          src={user?.client?.image}
                          alt="user"
                        />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={Link} href="/company-profile">
                          {t("ProfileFile")}
                        </Dropdown.Item>

                        <Dropdown.Item as={Link} href="/company-favorites">
                          {t("favourites")}
                        </Dropdown.Item>

                        <Dropdown.Item as={Link} href="/add-company-product">
                          {t("addAd")}
                        </Dropdown.Item>

                        <Dropdown.Item as={Link} href="/company-verification">
                          {t("tabs.verification")}
                        </Dropdown.Item>

                        <Dropdown.Item>
                          <LogoutComponent withIcon={false} isHome={true} />
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  aria-label="Login"
                  className="link "
                  onClick={handleShowAuthModal}
                >
                  <Image
                    width={16}
                    height={16}
                    src="/icons/user.svg"
                    alt="user"
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
