'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';

import { navItems } from './config';
import { navIcons } from './nav-icons';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        '--SideNav-background': 'var(--mui-palette-neutral-950)',
        '--SideNav-color': 'var(--mui-palette-common-white)',
        '--NavItem-color': 'var(--mui-palette-neutral-300)',
        '--NavItem-hover-background': 'rgba(255,255,255,0.04)',
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color':
          'var(--mui-palette-primary-contrastText)',
        '--NavItem-disabled-color':
          'var(--mui-palette-neutral-500)',
        '--NavItem-icon-color':
          'var(--mui-palette-neutral-400)',
        '--NavItem-icon-active-color':
          'var(--mui-palette-primary-contrastText)',
        '--NavItem-icon-disabled-color':
          'var(--mui-palette-neutral-600)',

        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',

        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        position: 'fixed',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',

        scrollbarWidth: 'none',

        '&::-webkit-scrollbar': {
          display: 'none',
        },

        '@keyframes anti-gravity': {
          '0%, 100%': { 
            transform: 'translateY(0) rotate(0deg) scale(1)', 
          },
          '33%': { 
            transform: 'translateY(-15px) rotate(3deg) scale(1.02)', 
          },
          '66%': { 
            transform: 'translateY(-10px) rotate(-2deg) scale(0.98)', 
          },
        },
      }}
    >
      {/* ===========================
          Brand
      =========================== */}

      <Stack spacing={1} sx={{ p: 2.5 }}>
        <Box
          component="a"
          href={paths.home}
          sx={{
            textDecoration: 'none',
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                border:
                  '1px solid rgba(94,234,212,.28)',
                background:
                  'linear-gradient(135deg, rgba(45,212,191,.18), rgba(37,99,235,.18))',
                animation:
                  'anti-gravity 4s ease-in-out infinite',
              }}
            >
              <Logo
                color="light"
                emblem
                width={33}
                height={33}
              />
            </Box>

            <Box>
              <Typography
                variant="h6"
                color="white"
                sx={{
                  lineHeight: 1.1,
                  letterSpacing: '-0.6px',
                }}
              >
                Helmetify
              </Typography>

              <Typography
                color="neutral.400"
                sx={{
                  mt: 0.5,
                  fontSize: '0.68rem',
                  letterSpacing: '0.12em',
                }}
              >
                SAFETY INTELLIGENCE
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <Divider
        sx={{
          borderColor:
            'var(--mui-palette-neutral-700)',
        }}
      />

      {/* ===========================
          Navigation
      =========================== */}

      <Box
        component="nav"
        sx={{
          flex: '1 1 auto',
          p: 2,
        }}
      >
        {renderNavItems({
          pathname,
          items: navItems,
        })}
      </Box>

      {/* ===========================
          Footer
      =========================== */}

      <Divider
        sx={{
          borderColor:
            'var(--mui-palette-neutral-700)',
        }}
      />

      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          component="img"
          src="/assets/tahir.jpg"
          alt="Tahir Mehmood"
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            objectFit: 'cover',
            border:
              '1.5px solid rgba(245, 243, 243, 0.62)',
          }}
        />

        <Box>
          <Typography
            variant="caption"
            sx={{
              color:
                'var(--mui-palette-neutral-500)',
            }}
          >
            Created by
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            Tahir Mehmood
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color:
                'var(--mui-palette-neutral-400)',
            }}
          >
            AI Application Developer
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function renderNavItems({
  items = [],
  pathname,
}: {
  items?: NavItemConfig[];
  pathname: string;
}): React.JSX.Element {
  return (
    <Stack
      component="ul"
      spacing={1}
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
      }}
    >
      {items.map((item) => {
        const { key, ...navItemProps } = item;

        return (
          <NavItem
            key={key}
            pathname={pathname}
            {...navItemProps}
          />
        );
      })}
    </Stack>
  );
}

interface NavItemProps
  extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
  });

  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: 'a',
              href,
              target: external
                ? '_blank'
                : undefined,
              rel: external
                ? 'noreferrer'
                : undefined,
            }
          : {
              role: 'button',
            })}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: 1,
          p: '8px 16px',
          textDecoration: 'none',
          color: 'var(--NavItem-color)',

          '&:hover': {
            bgcolor:
              'var(--NavItem-hover-background)',
          },

          ...(active && {
            bgcolor:
              'var(--NavItem-active-background)',
            color:
              'var(--NavItem-active-color)',
          }),

          ...(disabled && {
            cursor: 'not-allowed',
            color:
              'var(--NavItem-disabled-color)',
          }),
        }}
      >
        {Icon && (
          <Icon
            fill={
              active
                ? 'var(--NavItem-icon-active-color)'
                : 'var(--NavItem-icon-color)'
            }
            fontSize="var(--icon-fontSize-md)"
            weight={active ? 'fill' : undefined}
          />
        )}

        <Typography
          sx={{
            color: 'inherit',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>
    </li>
  );
}