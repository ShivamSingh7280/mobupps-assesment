import { Card, CardActionArea, Stack, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function AddProductCard({ onClick }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        minHeight: 320,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: 'divider',
        bgcolor: 'transparent',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:hover': { borderColor: 'secondary.main', bgcolor: 'action.hover' },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Stack alignItems="center" spacing={1} sx={{ color: 'text.secondary', py: 6 }}>
          <AddCircleOutlineIcon sx={{ fontSize: 40 }} color="secondary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Add Product
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
