import React, { FunctionComponent } from 'react';

import Button from '../Button/Button';
import InputText from '../InputText/InputText';
import $ from './Form.module.css';

interface FormEntry {
  name: string;
  placeholder: string;
  // TODO: Defined a suitable type for extra props
  // This type should cover all different of attribute types
  extraProps: React.InputHTMLAttributes<HTMLInputElement> & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

interface FormProps {
  label: string;
  loading?: boolean;
  formEntries: FormEntry[];
  onFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitText: string;
}

const Form: FunctionComponent<FormProps> = ({
  label,
  loading = false,
  formEntries,
  onFormSubmit,
  submitText
}) => {
  return (
    <form onSubmit={onFormSubmit}>
      <fieldset>
        <legend>{label}</legend>
        {formEntries.map(({ name, placeholder, extraProps }, index) => (
          <div key={`${name}-${index}`} className={$.formRow}>
            <InputText
              name={name}
              placeholder={placeholder}
              value={extraProps.value}
              onChange={extraProps.onChange}
            />
          </div>
        ))}

        <Button loading={loading} type="submit">
          {submitText}
        </Button>
      </fieldset>
    </form>
  );
};

export default Form;
