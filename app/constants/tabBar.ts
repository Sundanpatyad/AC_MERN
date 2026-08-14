import { Ionicons } from '@expo/vector-icons';

type TabRouteName = 'index' | 'mock-tests' | 'my-tests' | 'rankings' | 'profile';

export function getTabBarLabel(routeName: string, instructor: boolean): string {
  switch (routeName as TabRouteName) {
    case 'index':
      return instructor ? 'Console' : 'Home';
    case 'mock-tests':
      return 'Tests';
    case 'my-tests':
      return instructor ? 'Admin' : 'My Tests';
    case 'rankings':
      return 'Rankings';
    case 'profile':
      return 'Profile';
    default:
      return routeName;
  }
}

export function getTabBarIconName(
  routeName: string,
  focused: boolean,
  instructor: boolean
): keyof typeof Ionicons.glyphMap {
  switch (routeName as TabRouteName) {
    case 'index':
      if (instructor) return focused ? 'stats-chart' : 'stats-chart-outline';
      return focused ? 'home' : 'home-outline';
    case 'mock-tests':
      return focused ? 'list' : 'list-outline';
    case 'my-tests':
      if (instructor) return focused ? 'grid' : 'grid-outline';
      return focused ? 'book' : 'book-outline';
    case 'rankings':
      return focused ? 'trophy' : 'trophy-outline';
    case 'profile':
      return focused ? 'person' : 'person-outline';
    default:
      return focused ? 'ellipse' : 'ellipse-outline';
  }
}

export const HIDDEN_TAB_ROUTES = new Set(['explore']);

/** Visible tab order — profile is always last. */
export const TAB_ROUTE_ORDER = [
  'index',
  'mock-tests',
  'my-tests',
  'rankings',
  'profile',
] as const;

export function sortTabRoutes<T extends { name: string }>(
  routes: T[],
  instructor: boolean
): T[] {
  const order = instructor
    ? TAB_ROUTE_ORDER.filter((name) => name !== 'rankings')
    : [...TAB_ROUTE_ORDER];

  return [...routes].sort((a, b) => {
    const ai = order.indexOf(a.name as (typeof TAB_ROUTE_ORDER)[number]);
    const bi = order.indexOf(b.name as (typeof TAB_ROUTE_ORDER)[number]);
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
  });
}

export function isTabRouteVisible(
  routeName: string,
  instructor: boolean
): boolean {
  if (HIDDEN_TAB_ROUTES.has(routeName)) return false;
  if (instructor && routeName === 'rankings') return false;
  return true;
}
