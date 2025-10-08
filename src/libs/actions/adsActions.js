"use server";

import { revalidatePath } from "next/cache";
import serverAxios from "../axios/severAxios";
import { getUserType } from "@/services/auth/getUserType";

// ! ---------------------  submitProduct ------------------------!

export async function submitProduct(formData, user, id) {
  try {
    const isUpdate = Boolean(id);

    const form = new FormData();

    form.append("name_ar", formData.name_ar);
    form.append("name_en", formData.name_en);
    form.append("price", formData.price);
    form.append("category_id", formData.category_id);
    form.append("sub_category_id", formData.sub_category_id);
    form.append("city_id", formData.city_id);
    form.append("state_id", formData.state_id);
    form.append("description_ar", formData.description_ar);
    form.append("description_en", formData.description_en);
    form.append("type", formData.type);
    form.append("active_chat", formData.active_chat);
    form.append("active_whatsapp", formData.active_whatsapp);
    form.append("active_call", formData.active_call);
    form.append("country_id", formData.country_id);
    form.append("country_code", formData.country_code);
    form.append("phone", formData.phone);
    form.append("currency_id", formData.currency_id);

    if (isUpdate) {
      form.append("id", id);
    }
    if (user?.id) {
      form.append("country_id", user?.country?.id);
      form.append("currency_id", user?.country?.currency?.id);
    }

    // Delete images
    if (formData.delete_images?.length) {
      formData.delete_images.forEach((imgId) => {
        form.append("delete_images[]", imgId);
      });
    }
    // Main image
    if (formData?.images[0]?.type?.startsWith("image/")) {
      const image = formData.images[0];
      form.append("image", image);
    }

    // Additional images
    if (formData.images?.length) {
      formData.images.slice(1).forEach((imgFile) => {
        if (imgFile instanceof File) {
          form.append("images[]", imgFile);
        }
      });
    }

    const endpoint = `/client/${isUpdate ? "update-product" : "store-product"}`;

    const response = await serverAxios.post(endpoint, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      revalidatePath("/");
      return {
        success: true,
        data: response?.data,
      };
    }
  } catch (error) {
    const message =
      error?.response?.data?.message || "Failed to submit product";
    console.error("Submit product error:", message);
    return {
      success: false,
      message,
    };
  }
}

// --------------------------  delete ADs action ----------------------

export async function deleteAdAction(id) {
  const userType = await getUserType();
  try {
    const res = await serverAxios.post(`/${userType}/delete-product`, {
      product_id: id,
    });

    if (res?.status === 200) {
      revalidatePath("/profile/myAds");
      return {
        success: true,
        data: res.data,
      };
    }
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong while deleting the ad";

    return {
      success: false,
      message,
    };
  }
}

// !-------------------- submit Comapny product ------------- !
export async function submitCompanyProduct(formData, user, id) {
  try {
    const isUpdate = Boolean(id);

    const form = new FormData();

    form.append("name_ar", formData.name_ar);
    form.append("name_en", formData.name_en);
    form.append("price", formData.price);
    form.append("category_id", formData.category_id);
    form.append("sub_category_id", formData.sub_category_id);
    form.append("city_id", formData.city_id);
    form.append("state_id", formData.state_id);
    form.append("description_ar", formData.description_ar);
    form.append("description_en", formData.description_en);
    form.append("type", formData.type);
    form.append("active_chat", formData.active_chat);
    form.append("active_whatsapp", formData.active_whatsapp);
    form.append("active_call", formData.active_call);
    form.append("country_id", formData.country_id);
    form.append("country_code", formData.country_code);
    form.append("phone", formData.phone);
    form.append("currency_id", formData.currency_id);

    if (isUpdate) {
      form.append("id", id);
    }
    if (user?.id) {
      form.append("country_id", user?.country?.id);
      form.append("currency_id", user?.country?.currency?.id);
      form.append("category_id", user?.category?.id);
    }

    // Delete images
    if (formData.delete_images?.length) {
      formData.delete_images.forEach((imgId) => {
        form.append("delete_images[]", imgId);
      });
    }
    // Main image
    if (formData?.images[0]?.type?.startsWith("image/")) {
      const image = formData.images[0];
      form.append("image", image);
    }

    // Additional images
    if (formData.images?.length) {
      formData.images.slice(1).forEach((imgFile) => {
        if (imgFile instanceof File) {
          form.append("images[]", imgFile);
        }
      });
    }

    const endpoint = `/company/${
      isUpdate ? "update-product" : "store-product"
    }`;

    const response = await serverAxios.post(endpoint, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      revalidatePath("/");

      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    const message =
      error?.response?.data?.message || "Failed to submit product";
    return {
      success: false,
      message,
    };
  }
}
