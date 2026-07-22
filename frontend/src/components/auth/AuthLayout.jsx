import { Box, Stack, Typography } from '@mui/material';
import { serifFontFamily } from '../../theme/theme';

const stats = [
  { value: '12,400+', label: 'products managed' },
  { value: '3,000+', label: 'sellers onboard' },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Mobile-only brand band — gives the top of the screen something
          intentional instead of dead space above a centered form. */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          bgcolor: '#0F1B3D',
          color: '#FFFFFF',
          px: 4,
          pt: 8,
          pb: 7,
        }}
      >
        <Typography variant="h5" sx={{ fontFamily: serifFontFamily, fontWeight: 700 }}>
          Ledger
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 1.5, maxWidth: 320 }}>
          Manage your entire catalog from one place.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', p: { xs: 0, md: 4 } }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1040,
            display: 'flex',
            bgcolor: 'background.paper',
            borderRadius: { xs: '28px 28px 0 0', md: 5 },
            overflow: 'hidden',
            boxShadow: { xs: 'none', md: '0 20px 60px -20px rgba(15, 23, 42, 0.25)' },
            minHeight: { md: 640 },
            mt: { xs: -3, md: 0 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: '#0F1B3D',
              color: '#FFFFFF',
              p: 6,
            }}
          >
            <Typography variant="h5" sx={{ fontFamily: serifFontFamily, fontWeight: 700 }}>
              Ledger
            </Typography>

            <Box>
              <Typography
                variant="h3"
                sx={{ fontFamily: serifFontFamily, fontWeight: 700, mb: 2, lineHeight: 1.25 }}
              >
                Manage your entire catalog from one place.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 420 }}>
                Track stock, update pricing, and keep every listing current across every channel you sell on.
              </Typography>
            </Box>

            <Stack direction="row" spacing={5}>
              {stats.map((stat) => (
                <Box key={stat.label}>
                  <Typography variant="h5" sx={{ fontFamily: serifFontFamily, fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 4, sm: 6 },
              pt: { xs: 6, sm: 6 },
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: 380 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  {subtitle}
                </Typography>
                {children}
              </Box>
            </Box>

            <Typography
              variant="caption"
              color="text.disabled"
              textAlign="center"
              sx={{ display: { xs: 'block', md: 'none' }, pt: 3 }}
            >
              © {new Date().getFullYear()} Ledger. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
