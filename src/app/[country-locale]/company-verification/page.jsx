import VerificationTab from "@/components/profile/verification/VerificationTab";
import { getCategories } from "@/services/categories/getCategories";
import { getCountries } from "@/services/getCountries";

// Mark as dynamic - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function page() {
  const countries = await getCountries();
  const categories = await getCategories();
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-10 p-2">
          <VerificationTab categories={categories} countries={countries} />
        </div>
      </div>
    </div>
  );
}
