import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL, // example: https://task-manager-pzkz.onrender.com/api
    credentials: "include", // ✅ REQUIRED so cookies are always sent
  }),
  tagTypes: ["User", "Task"],
  endpoints: () => ({}),
})
