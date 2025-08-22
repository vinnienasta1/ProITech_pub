import React, { useState, useMemo } from 'react';
import {
  TextField,
  Autocomplete,
  Chip,
  Box,
  Typography,
} from '@mui/material';

interface AutocompleteSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  allowCustom?: boolean;
  helperText?: string;
}

const AutocompleteSelect: React.FC<AutocompleteSelectProps> = ({
  value,
  onChange,
  options,
  label,
  disabled = false,
  required = false,
  placeholder,
  allowCustom = true,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');

  const allOptions = useMemo(() => {
    if (!allowCustom) return options;
    return [...options, ...(value && !options.includes(value) ? [value] : [])];
  }, [options, value, allowCustom]);

  const handleChange = (event: any, newValue: string | null) => {
    onChange(newValue || '');
  };

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  return (
    <Box>
      <Autocomplete
        value={value}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        options={allOptions}
        freeSolo={allowCustom}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            helperText={helperText}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Typography variant="body2">
              {option}
            </Typography>
          </Box>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              size="small"
            />
          ))
        }
        sx={{ width: '100%' }}
      />
    </Box>
  );
};

export default AutocompleteSelect;
