import { SvgIconProps } from '@mui/material/SvgIcon';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon?: React.ComponentType<SvgIconProps>;
  children?: NavigationItem[];
  description?: string;
}

export const navigationConfig: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon,
    description: 'Your personalized dashboard',
  },
  {
    id: 'resources',
    title: 'Resources',
    path: '/resources',
    icon: SchoolIcon,
    description: 'Educational resources and guides',
    children: [
      {
        id: 'resources-templates',
        title: 'Templates',
        path: '/resources/templates',
        description: 'Downloadable templates and tools',
      },
      {
        id: 'resources-videos',
        title: 'Video Tutorials',
        path: '/resources/videos',
        description: 'Step-by-step video guides',
      },
      {
        id: 'resources-case-studies',
        title: 'Case Studies',
        path: '/resources/case-studies',
        description: 'Success stories and examples',
      },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    path: '/tools',
    icon: BuildIcon,
    description: 'Interactive tools and calculators',
    children: [
      {
        id: 'tools-calculators',
        title: 'Calculators',
        path: '/tools/calculators',
        description: 'Business and financial calculators',
      },
      {
        id: 'tools-optimization',
        title: 'Optimization Tools',
        path: '/tools/optimization',
        description: 'Performance optimization tools',
      },
    ],
  },
  {
    id: 'personas',
    title: 'Personas',
    path: '/personas',
    icon: PersonIcon,
    description: 'User personas and journeys',
    children: [
      {
        id: 'personas-starter',
        title: 'Starter',
        path: '/personas/starter',
        description: 'Resources for beginners',
      },
      {
        id: 'personas-growth',
        title: 'Growth',
        path: '/personas/growth',
        description: 'Resources for growing businesses',
      },
      {
        id: 'personas-enterprise',
        title: 'Enterprise',
        path: '/personas/enterprise',
        description: 'Resources for enterprise businesses',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    path: '/analytics',
    icon: AssessmentIcon,
    description: 'Performance analytics and insights',
  },
  {
    id: 'business',
    title: 'Business',
    path: '/business',
    icon: BusinessIcon,
    description: 'Business management tools',
    children: [
      {
        id: 'business-strategy',
        title: 'Strategy',
        path: '/business/strategy',
        description: 'Business strategy tools',
      },
      {
        id: 'business-operations',
        title: 'Operations',
        path: '/business/operations',
        description: 'Operations management tools',
      },
    ],
  },
]; 