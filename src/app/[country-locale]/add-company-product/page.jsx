import AddCompanyAdForm from "@/components/companies/AddCompanyAdForm";
import { getAuthedUser } from "@/services/auth/getAuthedUser";

export default async function Page() {
  const user = await getAuthedUser();
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <AddCompanyAdForm user={user?.client} />
      </div>
    </div>
  );
}
