import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Printers = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Принтеры
      </Typography>
      <Paper sx={{ p: 3 }}>
        Реестр принтеров и МФУ (в разработке).
      </Paper>
    </Box>
  );
};

export default Printers;


