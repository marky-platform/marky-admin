import { Box, FormLabel } from "@mui/material";
import Select from "react-select";

export const SelectMultiple = ({
  //@ts-ignore
  field,
  //@ts-ignore
  form,
  //@ts-ignore
  options,
  //@ts-ignore
  label,
  //@ts-ignore
  required,
  //@ts-ignore
  maxSelectable = 2,
  ...props
}) => {
  const { name, value } = field;
  const { setFieldValue } = form;
  //@ts-ignore
  const handleChange = (selectedOption) => {
    if (selectedOption.length <= maxSelectable) {
      setFieldValue(name, selectedOption);
    }
  };

  return (
    <Box>
      {label && (
        <FormLabel>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </FormLabel>
      )}
      <Select
        {...props}
        name={name}
        //@ts-ignore
        value={options?.find((option) => option.value === value)}
        onChange={handleChange}
        //@ts-ignore
        options={options}
        isMulti
        closeMenuOnSelect={true}
        components={{
          DropdownIndicator: () => null,
          ClearIndicator: () => null,
        }}
      />
    </Box>
  );
};
