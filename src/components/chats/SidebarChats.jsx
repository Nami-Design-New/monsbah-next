"use client";
import useGetChats from "@/hooks/queries/chat/useGetChats";
import clientAxios from "@/libs/axios/clientAxios";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { useTranslations } from "use-intl";
import ConfirmationModal from "../shared/modals/ConfirmationModal";
import ChatCard from "./ChatCard";
import ChatItemLoader from "./ChatItemLoader";

export default function SidebarChats({ setShowChats, chats }) {
  const t = useTranslations();
  const sideRef = useRef(null);
  const queryClient = useQueryClient();
  const [checkedState, setCheckedState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState();
  const [selectedChats, setSelectedChats] = useState([]);

  // const {
  //   data: chats,
  //   isLoading,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  // } = useGetChats();

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (!sideRef.current) return;

  //     const section = sideRef.current;
  //     const sectionBottom = section.getBoundingClientRect().bottom;
  //     const viewportHeight = window.innerHeight;

  //     if (
  //       sectionBottom <= viewportHeight + 200 &&
  //       hasNextPage &&
  //       !isFetchingNextPage
  //     ) {
  //       fetchNextPage();
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await clientAxios.post("/client/chat/delete", {
        ids: selectedChats,
      });
      if (res.status === 200) {
        toast.success(res.data.message);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        setSelectedChats([]);
        setCheckedState(false);
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const selectAll = () => {
    setSelectedChats(chats.map((chat) => chat.id));
  };
  const areArraysEqual = () => {
    const arr1 = chats?.map((chat) => chat.id) || [];
    if (arr1.length !== selectedChats.length) return false;
    return arr1.every((val) => selectedChats.includes(val));
  };

  return (
    <aside ref={sideRef}>
      <div className="checkAll_field">
        <Form.Check
          type="checkbox"
          label={t("chat.check")}
          checked={checkedState}
          onChange={() => setCheckedState(!checkedState)}
        />
        {checkedState && (
          <div className="d-flex align-items-center gap-3">
            {!areArraysEqual() && (
              <button aria-label="Select All" onClick={selectAll}>
                {t("chat.selectAll")}
              </button>
            )}
            {selectedChats?.length > 0 && (
              <button
                aria-label="Delete All"
                className="delete_all"
                onClick={() => setShowModal(true)}
              >
                <i className="fa-regular fa-trash" aria-hidden="true"></i>
                {t("chat.delete")}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="cards">
        {chats?.map((chat) => (
          <ChatCard
            key={chat.id}
            chat={chat}
            checkedState={checkedState}
            setSelectedChats={setSelectedChats}
            selectedChats={selectedChats}
            setShowChats={setShowChats}
          />
        ))}
        {/* {(isLoading || isFetchingNextPage) &&
          Array(3)
            .fill(0)
            .map((_, index) => <ChatItemLoader key={index} />)} */}
      </div>

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        eventFun={handleDelete}
        loading={loading}
        type="delete"
        buttonText={t("chat.delete")}
        text={t("chat.areYouSureYouWantDeleteThisChats")}
      />
    </aside>
  );
}
