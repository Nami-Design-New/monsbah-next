import EditCompanyPofile from "@/components/companies/EditCompanyPofile";
import { getAuthedUser } from "@/services/auth/getAuthedUser";
import React from "react";

// Mark as dynamic - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function page() {
  const user = await getAuthedUser();
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <EditCompanyPofile user={user?.client} />
      </div>
    </div>
  );
}
