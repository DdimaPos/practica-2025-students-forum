import { NavItem } from '../types/NavItem';
import {
  User,
  Settings,
  // BookOpen,
  // Users2,
  Github,
  DollarSign,
  PlusCircle,
  Layers,
  House,
} from 'lucide-react';

export const navSections: NavItem[][] = [
  [
    { href: '/', label: 'Go to main', icon: House },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
  [
    //{ href: '/students', label: 'Students', icon: Users2 },
    //{ href: '/professors', label: 'Professors', icon: BookOpen },
    //{ href: '/clubs', label: 'Clubs', icon: Layers },
    { href: '/channels', label: 'All Channels', icon: Layers },
    { href: '/create-channel', label: 'Create Channel', icon: PlusCircle },
  ],
  [
    {
      href: 'https://github.com/DdimaPos/practica_2025_documentation_vault',
      label: 'Github',
      icon: Github,
      external: true,
    },
    {
      href: 'https://github.com/DdimaPos/practica_2025_documentation_vault',
      label: 'Support',
      icon: DollarSign,
      external: true,
    },
  ],
];
