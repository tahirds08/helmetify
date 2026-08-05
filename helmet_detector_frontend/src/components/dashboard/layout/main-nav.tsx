'use client';

import * as React from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';
import { getAvatarUrl } from '@/lib/auth/client';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState(false);
  const { user } = useUser();

  const userPopover = usePopover<HTMLDivElement>();

  return (
    <>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px',
            px: 2,
          }}
        >
          {/* Mobile Menu */}

          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
            }}
          >
            <IconButton
              sx={{
                display: { lg: 'none' },
              }}
              onClick={() => {
                setOpenNav(true);
              }}
            >
              <ListIcon />
            </IconButton>
          </Stack>

          {/* User Avatar */}

          <Avatar
            ref={userPopover.anchorRef}
            src={getAvatarUrl(user?.avatar)}
            sx={{
              cursor: 'pointer',
            }}
            onClick={userPopover.handleOpen}
          />
        </Stack>
      </Box>

      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        open={userPopover.open}
        onClose={userPopover.handleClose}
      />

      <MobileNav
        open={openNav}
        onClose={() => {
          setOpenNav(false);
        }}
      />
    </>
  );
}
