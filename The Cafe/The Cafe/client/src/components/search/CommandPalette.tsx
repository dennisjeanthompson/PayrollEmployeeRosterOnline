import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  Box,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Settings as SettingsIcon,
  NavigateNext as ArrowIcon,
  Event as EventIcon,
  SwapHoriz as TradeIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

// Types
interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  type: 'page' | 'employee' | 'action';
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const theme = useTheme();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // Reset query and selection when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Fetch employees for search
  const { data: employeesData } = useQuery<{ employees: any[] }>({
    queryKey: ['/api/employees'],
    enabled: open, // Only fetch when open
  });

  // Define static navigation pages
  const pages: SearchResult[] = [
    {
      id: 'page-dashboard',
      title: 'Dashboard',
      subtitle: 'Game overview and stats',
      icon: <DashboardIcon fontSize="small" />,
      action: () => setLocation('/'),
      type: 'page',
    },
    {
      id: 'page-schedule',
      title: 'Schedule',
      subtitle: 'Manage shifts and timeline',
      icon: <ScheduleIcon fontSize="small" />,
      action: () => setLocation('/schedule'),
      type: 'page',
    },
    {
      id: 'page-employees',
      title: 'Employees',
      subtitle: 'Team directory and profiles',
      icon: <PeopleIcon fontSize="small" />,
      action: () => setLocation('/employees'),
      type: 'page',
    },
    {
      id: 'page-payroll',
      title: 'Payroll',
      subtitle: 'Process payments and view history',
      icon: <MoneyIcon fontSize="small" />,
      action: () => setLocation('/payroll-management'),
      type: 'page',
    },
    {
      id: 'page-trading',
      title: 'Shift Trading',
      subtitle: 'Marketplace for shift swaps',
      icon: <TradeIcon fontSize="small" />,
      action: () => setLocation('/shift-trading'),
      type: 'page',
    },
    {
      id: 'page-timeoff',
      title: 'Time Off',
      subtitle: 'Vacation and leave requests',
      icon: <EventIcon fontSize="small" />,
      action: () => setLocation('/time-off'),
      type: 'page',
    },
    {
      id: 'page-reports',
      title: 'Analytics',
      subtitle: 'Business intelligence reports',
      icon: <AssessmentIcon fontSize="small" />,
      action: () => setLocation('/reports'),
      type: 'page',
    },
    {
      id: 'page-settings',
      title: 'Settings',
      subtitle: 'System configuration',
      icon: <SettingsIcon fontSize="small" />,
      action: () => setLocation('/deduction-settings'),
      type: 'page',
    },
  ];

  // Filter results
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return pages; // Show all pages by default

    const filteredPages = pages.filter(
      p => p.title.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q)
    );

    const filteredEmployees: SearchResult[] = (employeesData?.employees || [])
      .filter(e => 
        e.firstName.toLowerCase().includes(q) || 
        e.lastName.toLowerCase().includes(q) ||
        e.position?.toLowerCase().includes(q)
      )
      .slice(0, 5) // Limit employee results
      .map(e => ({
        id: `emp-${e.id}`,
        title: `${e.firstName} ${e.lastName}`,
        subtitle: e.position || 'Employee',
        icon: <div style={{ 
          width: 24, 
          height: 24, 
          borderRadius: '50%', 
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          {e.firstName[0]}{e.lastName[0]}
        </div>,
        action: () => setLocation(`/employees?id=${e.id}`), // Navigate to employee details (logic might need adjustment in Employees page)
        type: 'employee',
      }));

    return [...filteredPages, ...filteredEmployees];
  }, [query, employeesData, theme]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, onClose]);

  // Ensure selection is valid when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: 'none',
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
          mt: -10, // Position slightly higher than center
        },
      }}
    >
      {/* Search Input */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <SearchIcon color="action" />
        <InputBase
          autoFocus
          fullWidth
          placeholder="Type a command or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            fontSize: '1.1rem',
            '& input::placeholder': {
              color: 'text.secondary',
              opacity: 0.7,
            },
          }}
        />
        <Box
          sx={{
            px: 0.8,
            py: 0.4,
            borderRadius: 0.5,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.action.active, 0.05),
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            ESC
          </Typography>
        </Box>
      </Box>

      {/* Results List */}
      <List
        ref={listRef}
        sx={{
          maxHeight: 400,
          overflow: 'auto',
          p: 1,
          '& .MuiListItemButton-root': {
            borderRadius: 1.5,
            mb: 0.5,
            transition: 'all 0.1s ease',
            '&.Mui-selected': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderLeft: `3px solid ${theme.palette.primary.main}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.15),
              },
            },
          },
        }}
      >
        {results.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No results found for "{query}"
            </Typography>
          </Box>
        ) : (
          results.map((result, index) => (
            <ListItem key={result.id} disablePadding>
              <ListItemButton
                selected={index === selectedIndex}
                onClick={() => {
                  result.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <ListItemIcon sx={{ minWidth: 40, color: index === selectedIndex ? 'primary.main' : 'text.secondary' }}>
                  {result.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={index === selectedIndex ? 600 : 400}
                      color={index === selectedIndex ? 'text.primary' : 'text.secondary'}
                    >
                      {result.title}
                    </Typography>
                  }
                  secondary={result.subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
                      {result.subtitle}
                    </Typography>
                  )}
                />
                {index === selectedIndex && (
                  <ArrowIcon fontSize="small" color="action" sx={{ opacity: 0.5 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
      
      {/* Footer */}
      <Box
        sx={{
          p: 1,
          px: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.action.hover, 0.05),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          <Box component="span" sx={{ fontWeight: 600 }}>↑↓</Box> to navigate
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <Box component="span" sx={{ fontWeight: 600 }}>↵</Box> to select
        </Typography>
      </Box>
    </Dialog>
  );
}

export default CommandPalette;
