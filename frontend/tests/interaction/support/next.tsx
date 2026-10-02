import { mock } from 'bun:test';

export const router = {
  push: mock((_href: string) => undefined),
  replace: mock((_href: string) => undefined),
  refresh: mock(() => undefined),
  back: mock(() => undefined),
  prefetch: mock(() => undefined),
};

export const toast = {
  success: mock((_message: string) => undefined),
  error: mock((_message: string) => undefined),
};

let pathname = '/';
let searchParams = new URLSearchParams();

export function setPathname(next: string) {
  pathname = next;
}

export function setSearchParams(next: string) {
  searchParams = new URLSearchParams(next);
}

export function resetNextMocks() {
  for (const fn of [...Object.values(router), ...Object.values(toast)]) fn.mockClear();
  pathname = '/';
  searchParams = new URLSearchParams();
}

mock.module('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
}));

mock.module('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

mock.module('next/image', () => ({
  default: ({
    fill: _fill,
    sizes: _sizes,
    alt,
    ...props
  }: React.ComponentProps<'img'> & { fill?: boolean }) => <img alt={alt} {...props} />,
}));

mock.module('sonner', () => ({ toast }));
