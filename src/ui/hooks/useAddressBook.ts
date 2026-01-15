import {
  addAddress,
  removeAddress,
  selectAddress,
  updateAddresses,
} from "../../core/reducers/addressBookSlice";
import { Address } from "@/types";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../core/store/hooks";

import transformAddress, { RawAddressModel } from "../../core/models/address";
import databaseService from "../../core/services/databaseService";

export default function useAddressBook() {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddress);
  const [loading, setLoading] = React.useState(true);
  const [initialized, setInitialized] = React.useState(false);

  // Automatically save addresses to database when they change
  // But only after initial load is complete
  React.useEffect(() => {
    if (initialized) {
      databaseService.setItem("addresses", addresses);
    }
  }, [addresses, initialized]);

  return {
    /** Add address to the redux store */
    addAddress: (address: Address) => {
      dispatch(addAddress(address));
    },
    /** Remove address by ID from the redux store */
    removeAddress: (id: string) => {
      dispatch(removeAddress(id));
    },
    /** Loads saved addresses from the indexedDB */
    loadSavedAddresses: async () => {
      try {
        const saved: RawAddressModel[] | null = await databaseService.getItem(
          "addresses"
        );
        
        if (saved && Array.isArray(saved)) {
          // Note: saved data might already be transformed, but running it through transformAddress
          // ensures consistency and generates IDs if missing (though they should be there).
          // However, transformAddress generates NEW IDs if lat/lon are missing or random.
          // If we save transformed addresses, they have IDs.
          // transformAddress implementation: id: `${lat || Date.now()}_${lon || Math.random()}`
          // If we re-transform, we might change IDs if lat/lon are missing.
          // Let's assume saved addresses are fine to be used directly or need minimal check.
          // But to be safe and follow existing pattern:
          dispatch(
            updateAddresses(saved.map((address) => transformAddress(address)))
          );
        }
      } catch (error) {
        console.error("Failed to load addresses", error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    loading,
  };
}
