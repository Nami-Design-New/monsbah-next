"use server";

import serverAxios from "../axios/severAxios";

export async function createReportAction(payload) {
  try {
    const res = await serverAxios.post(`/client/report-comment`, payload);

    if (res === 200) {
      return res?.data;
    }
  } catch (e) {
    throw new Error(error?.response?.data?.message);
  }
}
