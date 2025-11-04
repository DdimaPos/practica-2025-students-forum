import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  description: 'Profile page of the user',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
