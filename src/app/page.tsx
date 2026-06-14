import FormPage from "@/components/FormPage";
import { getSiteSettings } from "@/lib/firebase";

// 每次載入都讀最新設定，顧問在後台改完即時生效
export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getSiteSettings();
  return <FormPage bookingUrl={settings.booking_url} />;
}
