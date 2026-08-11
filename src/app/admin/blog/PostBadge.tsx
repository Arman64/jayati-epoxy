import { POST_STATUS_LABEL, POST_STATUS_TONE, type PostStatus } from '@/lib/postStatus';

export function PostBadge({ status }: { status: PostStatus }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${POST_STATUS_TONE[status]}`}
    >
      {POST_STATUS_LABEL[status]}
    </span>
  );
}
