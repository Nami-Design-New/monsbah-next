import Image from "next/image";
import ProfileInfo from "./ProfileInfo";
import ShareButton from "@/components/shared/ShareButton";

export default function CoverImageWithActions({ data }) {
  const {
    cover,
    image,
    email,
    username,
    name,
    id,
    state: { name_ar, name_en },
  } = data;
  return (
    <div className="cover-logo-wrapper col-12 p-2 mb-4 d-flex flex-column justify-content-end align-items-start">
      <div className="cover-wrapper">
        <Image
          fill={true}
          src={cover ? cover : "/banner.webp"}
          alt="user cover image"
        />
      </div>
      <div className="actions-wrapper d-flex justify-content-end mb-auto w-100">
        <ShareButton name={name} id={id} />
      </div>
      <ProfileInfo
        image={image}
        name={name}
        name_ar={name_ar}
        name_en={name_en}
        username={username}
        email={email}
      />
    </div>
  );
}
