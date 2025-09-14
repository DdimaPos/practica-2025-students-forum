import NavLink from './components/NavLink';
import {NavItem} from './types/NavItem';
import {
  User,
  Settings,
  BookOpen,
  Users2,
  Github,
  DollarSign,
  PlusCircle,
  Layers,
  House,
} from 'lucide-react';
import Logout from './components/Logout';

const navSections: NavItem[][] = [
  [
    {href: '/', label: 'Go to main', icon: House},
    {href: '/profile', label: 'Profile', icon: User},
    {href: '/settings', label: 'Settings', icon: Settings},
  ],
  [
    {href: '/students', label: 'Students', icon: Users2},
    {href: '/professors', label: 'Professors', icon: BookOpen},
    {href: '/clubs', label: 'Clubs', icon: Layers},
    {href: '/channels', label: 'All Channels', icon: Layers},
    {href: '/create-channel', label: 'Create Channel', icon: PlusCircle},
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

export default function Navbar() {
  return (
    <nav className='flex h-screen basis-1/4 flex-col justify-center gap-15 border-r pl-[8%] text-[#818181]'>
      {navSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className='flex flex-col gap-5'>
          {section.map((item, index) => (
            <NavLink key={index} {...item} />
          ))}
        </div>
      ))}
      <Logout />
    </nav>
  );
}
