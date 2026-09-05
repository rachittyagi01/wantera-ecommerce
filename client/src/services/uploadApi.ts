import { api } from "./api"

interface UploadResponse {
  message: string
  url: string
  publicId: string
}

export const uploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
    }),
  }),
})

export const { useUploadImageMutation } = uploadApi