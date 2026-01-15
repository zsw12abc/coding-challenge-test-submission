import { Address } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define a type for the slice state
interface CounterState {
  addresses: Address[];
}

// Define the initial state using that type
const initialState: CounterState = {
  addresses: [],
};

export const addressBookSlice = createSlice({
  name: "address",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<Address>) => {
      /** TODO: Prevent duplicate addresses */
      // Check for duplicates based on content (Name + Address) rather than just ID
      // because ID might be randomly generated on each search.
      const newAddr = action.payload;
      const exists = state.addresses.some(
        (addr) =>
          addr.firstName === newAddr.firstName &&
          addr.lastName === newAddr.lastName &&
          addr.postcode === newAddr.postcode &&
          addr.houseNumber === newAddr.houseNumber
      );

      if (!exists) {
        state.addresses.push(newAddr);
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      /** TODO: Write a state update which removes an address from the addresses array. */
      state.addresses = state.addresses.filter((address) => address.id !== action.payload);
    },
    updateAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
    },
  },
});

export const { addAddress, removeAddress, updateAddresses } =
  addressBookSlice.actions;

// // Other code such as selectors can use the imported `RootState` type
export const selectAddress = (state: RootState) => state.addressBook.addresses;

export default addressBookSlice.reducer;
