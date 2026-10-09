// What one shop sync did (gaderia_mobile_admin_back SyncResult), in words.

export type SyncResult = {
  ordersScanned: number;
  contactsFound?: number;
  created: number;
  updated: number;
  linkedToExisting: number;
};

/**
 * Every run asks the shop for orders changed after the newest one it saw,
 * minus one second, so two orders changed in the same second are not lost.
 * The newest known order therefore comes back each time: one order read and
 * nobody new means the shop had no changes, not that something is stuck.
 */
export function describeSyncResult(r: SyncResult): { summary: string; detail?: string } {
  if (r.ordersScanned <= 1 && r.created === 0) {
    return {
      summary: 'Змін на сайті немає',
      detail: r.ordersScanned === 1
        ? 'Перечитано лише останнє відоме замовлення — так задумано, щоб не загубити замовлення з тієї ж секунди'
        : undefined,
    };
  }
  return {
    summary: `Замовлень: ${r.ordersScanned} · нових покупців: ${r.created} · оновлено: ${r.updated} · зіставлено: ${r.linkedToExisting}`,
  };
}
