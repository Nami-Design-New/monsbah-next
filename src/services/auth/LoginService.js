// services/auth/loginService.js
export async function handleLogin({
  userType,
  country_code,
  phone,
  password,
  fcm_token = "",
}) {
  const formData = new FormData();
  const endPoint =
    userType === "company" ? "/company/auth/login" : "/client/auth/login";
  const fullPhone = country_code + phone;
  formData.append("phone", fullPhone);
  formData.append("password", password);
  formData.append("country_code", country_code);
  formData.append("fcm_token", fcm_token);
  formData.append("endPoint", endPoint);

  const response = await fetch("/api/login", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "Login failed");
  }

  return result?.data;
}
