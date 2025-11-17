import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

type IconName = 
  | 'search'
  | 'warning'
  | 'error'
  | 'robot'
  | 'star'
  | 'refresh'
  | 'empty'
  | 'arrow-back'
  | 'football'
  | 'trophy'
  | 'checkmark-circle'
  | 'close-circle'
  | 'information-circle'
  | 'close'
  | 'chevron-right'
  | 'check'
  | 'arrow-up'
  | 'arrow-down'
  | 'settings'
  | 'time'
  | 'menu';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
};

const iconMap: Record<IconName, { library: 'Ionicons' | 'MaterialIcons'; iconName: string }> = {
  search: { library: 'Ionicons', iconName: 'search' },
  warning: { library: 'Ionicons', iconName: 'warning' },
  error: { library: 'Ionicons', iconName: 'close-circle' },
  robot: { library: 'MaterialIcons', iconName: 'smart-toy' },
  star: { library: 'Ionicons', iconName: 'star' },
  refresh: { library: 'Ionicons', iconName: 'refresh' },
  empty: { library: 'Ionicons', iconName: 'folder-open' },
  'arrow-back': { library: 'Ionicons', iconName: 'arrow-back' },
  football: { library: 'MaterialIcons', iconName: 'sports-soccer' },
  trophy: { library: 'Ionicons', iconName: 'trophy' },
  'checkmark-circle': { library: 'Ionicons', iconName: 'checkmark-circle' },
  'close-circle': { library: 'Ionicons', iconName: 'close-circle' },
  'information-circle': { library: 'Ionicons', iconName: 'information-circle' },
  close: { library: 'Ionicons', iconName: 'close' },
  'chevron-right': { library: 'Ionicons', iconName: 'chevron-forward' },
  check: { library: 'Ionicons', iconName: 'checkmark' },
  'arrow-up': { library: 'Ionicons', iconName: 'arrow-up' },
  'arrow-down': { library: 'Ionicons', iconName: 'arrow-down' },
  settings: { library: 'Ionicons', iconName: 'settings' },
  time: { library: 'Ionicons', iconName: 'time' },
  menu: { library: 'Ionicons', iconName: 'menu' },
};

export function Icon({ name, size = 24, color = colors.textPrimary, style }: IconProps) {
  const iconConfig = iconMap[name];
  
  if (!iconConfig) {
    console.warn(`[Icon] Unknown icon name: ${name}`);
    return null;
  }

  const props = {
    name: iconConfig.iconName as any,
    size,
    color,
    style,
  };

  if (iconConfig.library === 'Ionicons') {
    return <Ionicons {...props} />;
  } else {
    return <MaterialIcons {...props} />;
  }
}

