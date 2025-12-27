import { redirect } from 'next/navigation';
import { DEFAULT_LANGUAGE } from '@/config/language';

export default function RootPage() {
  redirect(`/${DEFAULT_LANGUAGE}`);
}
