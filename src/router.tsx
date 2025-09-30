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

const basePath =
  baseFromEnv === '/' ? '' : baseFromEnv.replace(/\/$/, '');

function normalizeRelative(path: string): string {
  if (!path) return '/';
  const prefixed = path.startsWith('/') ? path : `/${path}`;
  if (prefixed === '/') return '/';
  return prefixed.replace(/\/+$/, '');
}

function stripBase(pathname: string): string {
  const normalized = pathname || '/';
  if (!basePath) {
    return normalizeRelative(normalized);
  }
  if (normalized === basePath || `${normalized}/` === `${basePath}/`) {
    return '/';
  }
  if (normalized.startsWith(`${basePath}/`)) {
    return normalizeRelative(normalized.slice(basePath.length));
  }
  return normalizeRelative(normalized);
}

function withBase(path: string): string {
  const normalized = normalizeRelative(path);
  if (!basePath) return normalized;
  if (normalized === '/') {
    return `${basePath}/`;
  }
  return `${basePath}${normalized}`;
}

function resolveRelativePath(current: string, target: string): string {
  if (!target) return normalizeRelative(current);
  if (target.startsWith('/')) {
    return normalizeRelative(target);
  }
  const base = current === '/' ? '' : current.replace(/\/[^\/]*$/, '');
  return normalizeRelative(`${base}/${target}`);
}

export function Router({ routes }: { routes: RouteConfig[] }) {
  const [path, setPath] = useState(() => stripBase(window.location.pathname || '/'));

  useEffect(() => {
    const handler = () => setPath(stripBase(window.location.pathname || '/'));
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback(
    (nextPath: string) => {
      const resolved = resolveRelativePath(path, nextPath);
      if (resolved === path) return;
      window.history.pushState({}, '', withBase(resolved));
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
  return (
    <a href={withBase(resolveRelativePath(currentPath, to))} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
