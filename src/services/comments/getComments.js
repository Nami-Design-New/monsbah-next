import serverAxios from "@/libs/axios/severAxios";
import React from "react";
import { getUserType } from "../auth/getUserType";

export async function getComments(id) {
  const userType = await getUserType();
  try {
    const res = await serverAxios.get(`/${userType}/comments?product_id=${id}`);
    if (res.status === 200) {
      return res.data.data || {};
    }
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    throw error;
  }
}
