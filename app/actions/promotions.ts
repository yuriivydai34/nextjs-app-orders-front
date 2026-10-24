import { apiFetch } from '../lib/api';

export type BannerTarget = 'none' | 'product' | 'link';

export type Banner = {
  id: number;
  title: string;
  image: string;
  image_url: string;
  target_type: BannerTarget;
  target_product_id: number | null;
  target_url: string | null;
  sort: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

/** What the form collects. The picture is a File only when it is being
 *  changed: editing a title must not make anyone upload the same file again. */
export type BannerDraft = {
  title: string;
  target_type: BannerTarget;
  target_product_id?: number | null;
  target_url?: string | null;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  image?: File | null;
};

const base = () => `${process.env.NEXT_PUBLIC_API_URL}/promotions`;

async function unwrap(res: Response) {
  if (res.ok) return res.json().catch(() => null);
  const body = await res.json().catch(() => ({}));
  // The API answers with the manager's own words ("Посилання: дозволені лише
  // http:// та https://"), so show those rather than a status code.
  throw new Error(
    typeof body?.message === 'string' ? body.message : 'Не вдалося зберегти банер',
  );
}

function toFormData(draft: BannerDraft): FormData {
  const fd = new FormData();
  fd.append('title', draft.title);
  fd.append('target_type', draft.target_type);
  fd.append('is_active', String(draft.is_active));
  // Always sent, so clearing a date in the form clears it on the server.
  fd.append('starts_at', draft.starts_at ?? '');
  fd.append('ends_at', draft.ends_at ?? '');
  if (draft.target_type === 'product') {
    fd.append('target_product_id', String(draft.target_product_id ?? ''));
  }
  if (draft.target_type === 'link') {
    fd.append('target_url', draft.target_url ?? '');
  }
  if (draft.image) fd.append('image', draft.image);
  return fd;
}

export async function listBanners(): Promise<Banner[]> {
  return unwrap(await apiFetch(base()));
}

export async function createBanner(draft: BannerDraft): Promise<Banner> {
  return unwrap(await apiFetch(base(), { method: 'POST', body: toFormData(draft) }));
}

export async function updateBanner(id: number, draft: BannerDraft): Promise<Banner> {
  return unwrap(await apiFetch(`${base()}/${id}`, { method: 'PATCH', body: toFormData(draft) }));
}

export async function deleteBanner(id: number): Promise<void> {
  await unwrap(await apiFetch(`${base()}/${id}`, { method: 'DELETE' }));
}

export async function reorderBanners(ids: number[]): Promise<Banner[]> {
  return unwrap(
    await apiFetch(`${base()}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }),
  );
}

/** The picture lives on the API, not on the website, so its URL is relative. */
export function bannerImageSrc(banner: Banner): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${banner.image_url}`;
}
