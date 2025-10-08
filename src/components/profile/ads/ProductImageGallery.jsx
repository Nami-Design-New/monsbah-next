"use client";

import { useTranslations } from "next-intl";
import { Form } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";

export default function ProductImageGallery({ disabled = false }) {
  const t = useTranslations();
  const {
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

  const handleRemoveImage = (indexToRemove, image, field) => {
    const updated = field.value.filter((_, i) => i !== indexToRemove);

    if (image?.id) {
      const deleted = getValues("delete_images") || [];
      setValue("delete_images", [...deleted, image.id]);
    }

    field.onChange(updated);
  };

  const handleFilesChange = (e, field) => {
    const files = Array.from(e.target.files);
    const current = field.value || [];

    const updated = [...current, ...files].slice(0, 6);
    field.onChange(updated);
  };

  return (
    <div className="form_group">
      <div className="input-field">
        <label htmlFor="certificate-image w-100">
          <div style={{ whiteSpace: "nowrap" }}>{t("ads.images")}</div>
          <span style={{ width: "unset", flex: "1" }}>
            ({t("ads.imagesHint")})
          </span>
        </label>

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <div className="images_grid_upload">
              {field.value?.length < 6 && (
                <div className="file_upload">
                  <label htmlFor="file_upload">
                    <input
                      type="file"
                      id="file_upload"
                      accept="image/*,video/*"
                      multiple
                      disabled={disabled}
                      onChange={(e) => {
                        handleFilesChange(e, field);
                        e.target.value = "";
                      }}
                    />
                    <img src="/icons/gallery.svg" alt="upload" />
                  </label>
                </div>
              )}

              {field.value?.map((image, index) => {
                const isVideo =
                  image?.type?.startsWith("video/") ||
                  image?.url?.endsWith(".mp4");

                const src =
                  image instanceof File
                    ? URL.createObjectURL(image)
                    : image?.url || image;

                return (
                  <div className="uploaded_file" key={index}>
                    {isVideo ? (
                      <video src={src} autoPlay muted loop playsInline />
                    ) : (
                      <img src={src} alt={`file-${index}`} />
                    )}

                    <button
                      aria-label="Remove"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage(index, image, field);
                      }}
                    >
                      <i className="fa-light fa-xmark"></i>
                    </button>

                    {index === 0 && (
                      <span className="mainImg">{t("ads.mainImage")}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        />
        {errors && (
          <Form.Control.Feedback type="invalid">
            {errors?.images?.message}
          </Form.Control.Feedback>
        )}
      </div>
    </div>
  );
}
