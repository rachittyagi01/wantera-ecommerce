import { api } from "./api"

export interface Address {
  _id: string
  name: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  country: string
  addressType: "HOME" | "WORK" | "OTHER"
  isDefault: boolean
}

interface AddressesResponse {
  addresses: Address[]
}

export const addressApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<AddressesResponse, void>({
      query: () => "/addresses",
      providesTags: ["User"],
    }),
    createAddress: builder.mutation<{ address: Address }, Partial<Address>>({
      query: (body) => ({
        url: "/addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
})

export const { useGetAddressesQuery, useCreateAddressMutation } = addressApi