export function isValidVideoExtension(source) {
  const validExtensions = [
    "mp4",
    "avi",
    "mkv",
    "mov",
    "wmv",
    "flv",
    "webm",
    "m4v",
    "3gp",
    "ts",
  ];
  const extension = source.split(".").pop().toLowerCase();
  return validExtensions.includes(extension);
}

export function extractPhoneFromCode(phone, code) {
  const fullNumber = phone?.toString();
  const fullCode = code?.toString().slice(1);

  if (fullNumber?.startsWith(fullCode)) {
    return Number(fullNumber.slice(fullCode?.length));
  } else {
    return Number(fullNumber);
  }
}

export function formatDateToYMDHM(dateString) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return ""; // Invalid date fallback

  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export const detectMobileTypeAndAppLink = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "https://apps.apple.com/eg/app/%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A9/id1589937521";
  } else if (/android/i.test(userAgent)) {
    return "https://play.google.com/store/apps/details?id=com.app.monasba&pcampaignid=web_share";
  } else {
    return "https://apps.apple.com/eg/app/%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A9/id1589937521";
  }
};
