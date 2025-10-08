import { Link } from "@/i18n/navigation";
import Image from "next/image";

function NotificationCard({ item, bgColor }) {
  return (
    <Link
      aria-label="Notification"
      href={
        item?.type === "product" ? `/product/${item?.product_id}` : `/chats`
      }
      className={`notificationCard ${bgColor}`}
      key={item.id}
      //   onClick={() => onClick?.()}
    >
      <div className="img">
        <Image width={48} height={48} src={item?.image} alt={item?.name} />
      </div>
      <div className="notify">
        <h6>{item?.name}</h6>
        <p>{item?.date}</p>
      </div>
    </Link>
  );
}

export default NotificationCard;
