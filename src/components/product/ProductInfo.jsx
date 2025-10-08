"use client";
import { Link } from "@/i18n/navigation";
import { toggleFavorite } from "@/libs/actions/favoritesActions";
import { useAuthModal } from "@/stores/useAuthModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useOptimistic, useState, useTransition } from "react";
import { Dropdown } from "react-bootstrap";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import ShareButton from "../shared/ShareButton";
import ReportModal from "../shared/modals/ReportModal";

export default function ProductInfo({ product }) {
  const { user } = useAuthStore((state) => state);
  const { onOpen } = useAuthModal((state) => state);
  const [showReportModal, setShowReportModal] = useState(false);
  const { userType } = useAuthModal((state) => state);
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const [optimisticFav, setOptimisticFav] = useOptimistic(
    product,
    (currentProduct, action) => {
      if (action.type === "TOGGLE_FAV") {
        const is_favorite = !currentProduct.is_favorite;
        return {
          ...currentProduct,
          is_favorite,
        };
      }
      return currentProduct;
    }
  );

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(() => {
      setOptimisticFav({ type: "TOGGLE_FAV" });
    });

    const res = await toggleFavorite(optimisticFav?.id, userType);

    if (!res?.success) {
      toast.error(res.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast.success(res?.data?.message);
    }
  };

  return (
    <>
      <div className="priceInfo mt-3">
        <h4 className="price">
          <span>{product?.price}</span> {product?.currency?.name}
        </h4>
        {user?.id !== product?.user?.id ? (
          <button
            aria-label="Toggle Favorite"
            disabled={isPending}
            onClick={user?.id ? handleFavorite : onOpen}
            className={`favorite ${optimisticFav?.is_favorite ? "active" : ""}`}
          >
            <i className="fa-light fa-heart"></i>
          </button>
        ) : (
          <Dropdown
            onClick={(e) => e.stopPropagation()}
            className="favorite dropdown-icon"
          >
            <Dropdown.Toggle
              aria-label="Product Actions"
              id="dropdown-basic"
              className="upload-btn"
            >
              <i className="fa-regular fa-ellipsis-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                as={Link}
                to={
                  userType
                    ? `/profile/addAd/${product?.id}`
                    : `/edit-product/${product?.id}`
                }
              >
                <i className="fa-regular fa-pen-to-square"></i>
                {t("edit")}
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="fa-regular fa-trash"></i>
                {t("delete")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
        <div className="actions">
          <ShareButton className={"action-btn report"} title={t("share")} />
          {user?.id !== product?.user?.id && (
            <button
              className="action-btn report"
              onClick={() => {
                setShowReportModal(true);
              }}
            >
              <i className="fa-regular fa-flag"></i> {t("report")}
            </button>
          )}
        </div>
      </div>
      <div className="itemInfo mt-3">
        <h3 className="title">{product?.name}</h3>

        <div className="itemBottom">
          <div className="location">
            <i className="fa-light fa-location-dot"></i>
            <span>
              {product?.country?.name}, {product?.city?.name}
            </span>
          </div>
          <div className="time">
            <i className="fa-light fa-clock"></i> {product?.create_at}
          </div>
        </div>
        <p className="description">{product?.description}</p>
      </div>
      <ReportModal
        id={product?.id}
        type="product"
        showModal={showReportModal}
        setShowModal={setShowReportModal}
      />
    </>
  );
}
