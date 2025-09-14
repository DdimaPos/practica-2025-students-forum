import Link from 'next/link';
import {NavItem} from '../types/NavItem';

export default function NavLink({href, label, icon: Icon, external}: NavItem) {
  const baseClass =
    'flex items-center gap-2 transition-colors duration-300 hover:text-black';

  if (external) {
    return (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className={baseClass}
      >
        <Icon className='h-5 w-5' /> {label}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClass}>
      <Icon className='h-5 w-5' /> {label}
    </Link>
  );
}
