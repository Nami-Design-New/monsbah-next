import React from "react";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { GrYoutube } from "react-icons/gr";
import { IoLogoTiktok } from "react-icons/io5";
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

export const SocialLinks = () => {
  return (
    <div className="social_media">
      <ul>
        {socialLinks.map(({ href, label, icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              {icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
