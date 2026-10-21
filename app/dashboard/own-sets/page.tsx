import OwnSetsSettings from './_components/own-sets-settings';
import PackMixesSettings from './_components/pack-mixes-settings';

export const metadata = { title: 'Поштучно' };

// Juices by the bottle in the app: who sees bottles instead of boxes, and the
// ready-made mixes that put a whole box of different flavours in the cart.
export default function OwnSetsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Соки поштучно</h2>

      <OwnSetsSettings />

      <PackMixesSettings />
    </div>
  );
}
