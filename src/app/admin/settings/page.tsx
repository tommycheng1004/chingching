import { getSiteSettings } from "@/lib/firebase";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-1">設定</h1>
      <p className="text-sm text-gray-500 mb-6">這裡改的內容會即時套用到前台表單，不需要重新部署。</p>
      <SettingsForm bookingUrl={settings.booking_url} />
    </div>
  );
}
