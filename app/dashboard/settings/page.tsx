import AppVersions from './_components/app-versions';
import SystemStatusSections from './_components/system-status';
import BotSettings from './_components/bot-settings';

export const metadata = { title: 'Налаштування' };

// Only settings that do something. The page used to also show a made-up
// profile and company, notification switches that saved nothing and a
// "delete account" button with no action; they were removed rather than left
// to look like they work.
export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Налаштування</h2>

      <SystemStatusSections />

      <BotSettings />

      <AppVersions />
    </div>
  );
}
