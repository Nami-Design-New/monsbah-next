"use client";

import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { GrYoutube } from "react-icons/gr";
import { IoLogoTiktok } from "react-icons/io5";
import styles from "./TopHeader.module.css";

const socialLinks = [
  {
    href: "https://youtube.com/@monsbah?si=GoCRIgXYQgJqiGRl",
    label: "YouTube",
    icon: <GrYoutube />,
  },
  {
    href: "https://www.instagram.com/monsbah/profilecard/?igsh=eGhycjkydHBlcmky",
    label: "Instagram",
    icon: <FaInstagram />,
  },
  {
    href: "https://www.tiktok.com/@monsbah?_t=8qmq24madhi&_r=1",
    label: "TikTok",
    icon: <IoLogoTiktok />,
  },
  {
    href: "https://x.com/monsbah?s=11",
    label: "Twitter",
    icon: <FaXTwitter />,
  },
];

export default function TopHeader() {
  return (
    <div className={styles.topHeader}>
      <div className="container">
        <div className={styles.content}>
            <div></div>
          <ul className={styles.socialLinks}>
            {socialLinks.map(({ href, label, icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.socialLink}
                >
                  {icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
