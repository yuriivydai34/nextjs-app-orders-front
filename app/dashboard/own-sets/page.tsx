import OwnSetsSettings from './_components/own-sets-settings';

export const metadata = { title: 'Поштучно' };

// Juices by the bottle in the app: who sees bottles instead of boxes.
export default function OwnSetsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Соки поштучно</h2>

      <OwnSetsSettings />
    </div>
  );
}
