import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  const alternates = await generateHreflangAlternates("/contact");

  return {
    title: t("contact.title"),
    description: t("contact.description"),
    alternates,
  };
}

export default function Contact() {
  return (
    <section className="contact_section">
      <div className="container">
        <div className="row">
          <ContactInfo />

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
