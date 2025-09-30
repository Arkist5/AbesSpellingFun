import {
  createContext,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

export type RouteConfig = {
  path: string;
  element: ReactNode;
};

type RouterContextValue = {
  path: string;
  navigate: (path: string) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function matchRoute(path: string, routes: RouteConfig[]): ReactNode | null {
  const route = routes.find((entry) => entry.path === path);
  return route?.element ?? null;
}

const baseFromEnv =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';

const baseHrefPrefix = baseFromEnv === '/' ? '' : baseFromEnv;

function normalizeRelative(path: string): string {
  if (!path) return '/';
  const prefixed = path.startsWith('/') ? path : `/${path}`;
  if (prefixed === '/') return '/';
  return prefixed.replace(/\/+$/, '');
}

function hashToPath(hash: string): string {
  if (!hash || hash === '#') return '/';
  return normalizeRelative(hash.replace(/^#/, ''));
}

function pathToHash(path: string): string {
  const normalized = normalizeRelative(path);
  if (normalized === '/') return '#/';
  return `#${normalized}`;
}

function hrefWithBase(hash: string): string {
  if (!baseHrefPrefix) return hash;
  return `${baseHrefPrefix}${hash}`;
}

function resolveRelativePath(current: string, target: string): string {
  if (!target) return normalizeRelative(current);
  if (target.startsWith('/')) {
    return normalizeRelative(target);
  }
  const base = current === '/' ? '' : current.replace(/\/[^\/]*$/, '');
  return normalizeRelative(`${base}/${target}`);
}

function currentPathFromHash(): string {
  return hashToPath(window.location.hash);
}

export function Router({ routes }: { routes: RouteConfig[] }) {
  const [path, setPath] = useState(() => currentPathFromHash());

  useEffect(() => {
    const handler = () => setPath(currentPathFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback(
    (nextPath: string) => {
      const resolved = resolveRelativePath(path, nextPath);
      if (resolved === path) return;
      const targetHash = pathToHash(resolved);
      if (window.location.hash === targetHash) return;
      window.location.hash = targetHash;
      setPath(resolved);
    },
    [path]
  );

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  const element = matchRoute(path, routes) ?? matchRoute('/', routes);

  return <RouterContext.Provider value={value}>{element}</RouterContext.Provider>;
}

export function useNavigate() {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useNavigate must be used within Router');
  return context.navigate;
}

export function usePathname() {
  const context = useContext(RouterContext);
  if (!context) throw new Error('usePathname must be used within Router');
  return context.path;
}

type LinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
};

export function Link({ to, children, className }: LinkProps) {
  const navigate = useNavigate();
  const currentPath = usePathname();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const resolved = resolveRelativePath(currentPath, to);
    navigate(resolved);
  };
  const targetHash = pathToHash(resolveRelativePath(currentPath, to));
  return (
    <a href={hrefWithBase(targetHash)} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
