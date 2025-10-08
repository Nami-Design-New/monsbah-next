import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import clientAxios from "../../../libs/axios/clientAxios";
import useGetProduct from "./useGetProduct";

const initialFormState = {
  images: [],
  image: "",
  name_ar: "",
  name_en: "",
  category_id: "",
  sub_category_id: "",
  city_id: "",
  state_id: "",
  description_ar: "",
  description_en: "",
  type: "sale",
  active_chat: "inactive",
  active_whatsapp: "inactive",
  active_call: "inactive",
};

export default function useAdForm(product_id) {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.clientData.client);
  const { lang } = useSelector((state) => state.language);
  const { data: product } = useGetProduct(+product_id);

  const [productImages, setProductImages] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState(null);

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      image: formData?.images[0],
    }));
  }, [formData?.images]);

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      country_id: user?.country?.id,
      city_id: user?.city?.id,
      state_id: user?.state?.id,
      phone: user?.phone,
      country_code: user?.country?.country_code,
      currency_id: user?.country?.currency?.id,
      category_id: 1,
      sub_category_id: 10,
    }));
  }, [user]);

  useEffect(() => {
    if (product && product_id) {
      setFormData((prevState) => ({
        ...prevState,
        name_ar: product?.name,
        name_en: product?.name,
        category_id: product?.category?.id,
        sub_category_id: product?.sub_category?.id,
        city_id: product?.city?.id,
        state_id: product?.state?.id,
        description_ar: product?.description,
        description_en: product?.description,
        type: product?.type,
        price: product?.price,
        active_chat: product?.active_chat,
        active_whatsapp: product?.active_whatsapp,
        active_call: product?.active_call,
        image: product?.image,
        images: product?.images?.map((image) =>
          image?.image ? image?.image : null
        ),
      }));
      const srcs = product?.images?.map((image) => image?.image);
      if (srcs) {
        setProductImages([product?.image, ...srcs]);
      }
    }
  }, [product, product_id]);

  const handleImagesChange = (e) => {
    e.preventDefault();
    const newImages = Array.from(e.target.files);
    if (newImages.length > 6) {
      toast.warning("Maximum 6 images allowed");
      return;
    }
    setProductImages((prevState) => [...prevState, ...newImages]);
    setFormData((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...newImages],
    }));
  };

  const handleRemoveImage = (e, index, image) => {
    e.preventDefault();
    if (image.id) {
      setFormData((prevState) => ({
        ...prevState,
        images: prevState.images.filter((_, i) => i !== index),
        delete_images: [...(prevState.delete_images || []), image.id],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        images: prevState.images.filter((img) => img !== image),
        delete_images: [...(prevState.delete_images || []), image],
      }));
    }
    setProductImages((prevState) => prevState.filter((_, i) => i !== index));
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount <= 5) {
      setFormData((prevState) => ({
        ...prevState,
        name_ar: value,
        name_en: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const requestBody = {
      name_ar: formData?.name_ar,
      name_en: formData?.name_en,
      price: formData?.price,
      category_id: formData?.category_id,
      sub_category_id: formData?.sub_category_id,
      city_id: formData?.city_id,
      state_id: formData?.state_id,
      description_ar: formData?.description_ar,
      description_en: formData?.description_en,
      type: formData?.type,
      active_chat: formData?.active_chat,
      active_whatsapp: formData?.active_whatsapp,
      active_call: formData?.active_call,
      delete_images: formData?.delete_images,
      country_id: user?.country?.id,
      country_code: formData?.country_code,
      phone: formData?.phone,
      currency_id: formData?.currency_id,
    };

    if (productImages?.length < 1) {
      toast.error("At least one image is required");
      setLoading(false);
      return;
    }

    if (productImages[0]?.type?.startsWith("image/")) {
      requestBody.image = productImages[0];
    }
    productImages?.slice(1).forEach((image) => {
      if (image?.type?.startsWith("image/")) {
        if (requestBody?.images) {
          requestBody.images = [...requestBody.images, image];
        } else {
          requestBody.images = [image];
        }
      }
    });

    if (formData?.delete_images) {
      requestBody.delete_images = formData?.delete_images;
    }

    if (product_id) {
      requestBody.id = product_id;
    }

    try {
      const res = await clientAxios.post(
        `/client/${product_id ? "update-product" : "store-product"}`,
        requestBody,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 200) {
        toast.success(res.data.message);
        setShowModal(true);
        setFormData(initialFormState);
        if (product_id) {
          queryClient.invalidateQueries(["product", lang, product_id]);
        }
        setProductId(product_id || res.data.data.id);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["allProducts"] });
        queryClient.invalidateQueries({ queryKey: ["user-products"] });
        queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response.data.message);
      throw new Error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    productImages,
    newPhoneNumber,
    setNewPhoneNumber,
    loading,
    showModal,
    setShowModal,
    productId,
    handleImagesChange,
    handleRemoveImage,
    handleNameChange,
    handleSubmit,
  };
}
