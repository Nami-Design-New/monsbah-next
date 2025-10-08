import { getLocale } from "next-intl/server";
import Image from "next/image";
import React from "react";

export default async function ProfileInfo({
  image,
  name,
  username,
  email,
  name_ar,
  name_en,
}) {
  const lang = await getLocale();
  return (
    <div className="Profile_info">
      <div className="logo-wrapper">
        <Image
          fill={true}
          src={image ? image : "/icons/user.svg"}
          alt="user logo image"
        />
      </div>
      <div className="name">
        {name ? (
          <h1>
            {lang === "en" ? username : name}{" "}
            <span>( {lang === "en" ? name_en : name_ar} )</span>
          </h1>
        ) : null}
        {email ? <p>{email}</p> : null}
      </div>
    </div>
  );
}
