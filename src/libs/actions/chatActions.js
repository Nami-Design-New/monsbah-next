"use server";

import { revalidatePath } from "next/cache";
import serverAxios from "../axios/severAxios";

export async function sendMessageAction(formData) {
  try {
    const payload = new FormData();

    for (const [key, value] of formData.entries()) {
      if (value) payload.append(key, value);
    }

    const res = await serverAxios.post("/client/chat/send", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data.status === 200) {
      revalidatePath("/chats");
      return { success: true, data: res.data.data, message: res.data.message };
    } else {
      return { success: false, error: res.data.message };
    }
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.message || "Unknown error",
    };
  }
}

export async function deleteChatAction(chatId) {
  try {
    const res = await serverAxios.post("/client/chat/delete", {
      ids: [chatId],
    });

    if (res.status === 200) {
      revalidatePath("/chats");
      return { success: true, message: res.data.message };
    }

    return { success: false, error: res.data.message };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || "Delete failed.",
    };
  }
}

export async function blockChatAction(chatId) {
  try {
    const res = await serverAxios.post("/client/chat/block", {
      chat_id: +chatId,
    });

    if (res.status === 200) {
      return { success: true, message: res.data.message };
    }

    return { success: false, error: res.data.message };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || "Block failed.",
    };
  }
}
