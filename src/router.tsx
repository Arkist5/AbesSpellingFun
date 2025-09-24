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

function resolvePath(href: string): string {
  if (!href.startsWith('/')) {
    const base = window.location.pathname.replace(/\/$/, '');
    return `${base}/${href}`;
  }
  return href;
}

export function Router({ routes }: { routes: RouteConfig[] }) {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handler = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback(
    (nextPath: string) => {
      if (nextPath === path) return;
      window.history.pushState({}, '', nextPath);
      setPath(nextPath);
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
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const resolved = resolvePath(to);
    navigate(resolved);
  };
  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
