import { getAuthUser } from "@/lib/auth";
import LandingPage from "@/components/landing/landing-page";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dompi • Catat Duit, Tanpa Drama. Kelola Dompet Cerdas Pakai AI',
  description:
    'Platform pencatat keuangan neo-brutalist dengan AI native NLP Bahasa Indonesia dan integrasi Telegram bot.',
};

export default async function Home() {
  const user = await getAuthUser();
  return <LandingPage userEmail={user?.email} />;
}
