import React from "react";

import Address from "@/components/Address/Address";
import AddressBook from "@/components/AddressBook/AddressBook";
import Button from "@/components/Button/Button";
import Radio from "@/components/Radio/Radio";
import Section from "@/components/Section/Section";
import useAddressBook from "@/hooks/useAddressBook";
import { useForm } from "@/hooks/useForm";
import Form from "@/components/Form/Form";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import transformAddress from "./core/models/address";

import { Address as AddressType } from "./types";

function App() {
  const { values, handleChange, resetForm } = useForm({
    postCode: "",
    houseNumber: "",
    firstName: "",
    lastName: "",
    selectedAddress: "",
  });

  const [error, setError] = React.useState<undefined | string>(undefined);
  const [addresses, setAddresses] = React.useState<AddressType[]>([]);
  const [loading, setLoading] = React.useState(false);

  const { addAddress } = useAddressBook();

  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setAddresses([]);

    if (!values.postCode || !values.houseNumber) {
      setError("Postcode and House number are required");
      return;
    }

    setLoading(true);
    try {
      // Use NEXT_PUBLIC_URL or fallback to localhost
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/getAddresses?postcode=${values.postCode}&streetnumber=${values.houseNumber}`
      );

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(data.errormessage || "Failed to fetch addresses");
      }

      // API returns { status: "ok", details: [...] }
      const results = data.details ? (Array.isArray(data.details) ? data.details : [data.details]) : [];
      
      if (results.length === 0) {
        setError("No addresses found");
      }

      // Transform addresses: add houseNumber using transformAddress function
      const transformedAddresses = results.map((addr: any) => {
        const rawAddress = { ...addr, houseNumber: values.houseNumber };
        return transformAddress(rawAddress);
      });

      setAddresses(transformedAddresses);
    } catch (err: any) {
      setError(err.message || "Error fetching addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!values.firstName || !values.lastName) {
      setError("First name and last name fields mandatory!");
      return;
    }

    if (!values.selectedAddress) {
      setError(
        "No address selected, try to select an address or find one if you haven't"
      );
      return;
    }

    const foundAddress = addresses.find(
      (address) => address.id === values.selectedAddress
    );

    if (!foundAddress) {
      setError("Selected address not found");
      return;
    }

    addAddress({ ...foundAddress, firstName: values.firstName, lastName: values.lastName });
  };

  const handleClear = () => {
    resetForm();
    setAddresses([]);
    setError(undefined);
  };

  return (
    <main>
      <Section>
        <h1>
          Create your own address book!
          <br />
          <small>
            Enter an address by postcode add personal info and done! 👏
          </small>
        </h1>
        
        <Form
          label="🏠 Find an address"
          loading={loading}
          onFormSubmit={handleAddressSubmit}
          submitText="Find"
          formEntries={[
            {
              name: "postCode",
              placeholder: "Post Code",
              extraProps: { value: values.postCode, onChange: handleChange },
            },
            {
              name: "houseNumber",
              placeholder: "House number",
              extraProps: { value: values.houseNumber, onChange: handleChange },
            },
          ]}
        />

        {addresses.length > 0 &&
          addresses.map((address) => {
            return (
              <Radio
                name="selectedAddress"
                id={address.id}
                key={address.id}
                onChange={handleChange}
                checked={values.selectedAddress === address.id}
              >
                <Address {...address} />
              </Radio>
            );
          })}

        {values.selectedAddress && (
          <Form
            label="✏️ Add personal info to address"
            onFormSubmit={handlePersonSubmit}
            submitText="Add to addressbook"
            formEntries={[
              {
                name: "firstName",
                placeholder: "First name",
                extraProps: { value: values.firstName, onChange: handleChange },
              },
              {
                name: "lastName",
                placeholder: "Last name",
                extraProps: { value: values.lastName, onChange: handleChange },
              },
            ]}
          />
        )}

        <ErrorMessage message={error} />

        <Button variant="secondary" onClick={handleClear}>
          Clear all fields
        </Button>
      </Section>

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
