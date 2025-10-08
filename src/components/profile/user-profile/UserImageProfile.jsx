import Image from "next/image";

export default function UserImageProfile({ client }) {
  return (
    <div className="img">
      <Image width={122} height={122} src={client?.image} alt="company" />
    </div>
  );
}
