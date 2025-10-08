import { getLocale } from "next-intl/server";
import UserDetailsBox from "./UserDetailsBox";
import Image from "next/image";

export default async function UserDetailBoxes({ country, city }) {
  const lang = await getLocale();
  return (
    <>
      {country && (
        <div className="col-lg-6 col-12 p-2">
          <UserDetailsBox>
            {country?.image && (
              <div className="img-wrapper">
                <Image
                  width={24}
                  height={24}
                  src={country?.image}
                  alt="user logo image"
                />
              </div>
            )}
            {country?.name}
          </UserDetailsBox>
        </div>
      )}
      {city && (
        <div className="col-lg-6 col-12 p-2">
          <UserDetailsBox>
            {" "}
            {lang === "en" ? city?.name_en : city?.name_ar}
          </UserDetailsBox>
        </div>
      )}
    </>
  );
}
