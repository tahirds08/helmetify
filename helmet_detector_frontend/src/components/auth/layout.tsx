import * as React from 'react';
import RouterLink from 'next/link';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';
import { Logo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({
  children,
}: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Logo & Brand */}

      <Box sx={{ p: 3 }}>
        <Box
          component="a"
          href={paths.home}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            width: 'fit-content',
          }}
        >
          <Logo
            color="light"
            emblem
            height={40}
            width={40}
          />

          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'black',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              Helmetify
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: 'rgba(22, 22, 22, 0.75)',
                letterSpacing: '0.15em',
                fontSize: '0.65rem',
              }}
            >
              SAFETY INTELLIGENCE
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Authentication Card */}

      <Box
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          pb: 3,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 450,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}