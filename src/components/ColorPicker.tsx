import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

const colorPresets = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#000000'
];

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label, disabled = false }) => {
  return (
    <Box>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {colorPresets.map((color) => (
          <Tooltip key={color} title={color}>
            <Box
              sx={{
                width: 32,
                height: 32,
                backgroundColor: color,
                border: value === color ? '3px solid #1976d2' : '2px solid #e0e0e0',
                borderRadius: 1,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                '&:hover': disabled ? {} : {
                  borderColor: '#1976d2',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
              onClick={() => !disabled && onChange(color)}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default ColorPicker;
