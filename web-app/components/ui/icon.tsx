import { IoSearch, IoWarning, IoCloseCircle, IoStar, IoRefresh, IoFolderOpen, IoArrowBack, IoTrophy, IoCheckmarkCircle, IoInformationCircle, IoClose, IoChevronForward, IoCheckmark, IoArrowUp, IoArrowDown, IoSettings, IoTime, IoMenu, IoTrendingUp } from 'react-icons/io5';
import { MdSmartToy, MdSportsSoccer } from 'react-icons/md';
import { colors } from '@/lib/theme';
import { View } from 'react-native';

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
  | 'menu'
  | 'trending-up';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
};

const iconMap: Record<IconName, React.ComponentType<{ size?: number; color?: string; style?: any }>> = {
  search: IoSearch,
  warning: IoWarning,
  error: IoCloseCircle,
  robot: MdSmartToy,
  star: IoStar,
  refresh: IoRefresh,
  empty: IoFolderOpen,
  'arrow-back': IoArrowBack,
  football: MdSportsSoccer,
  trophy: IoTrophy,
  'checkmark-circle': IoCheckmarkCircle,
  'close-circle': IoCloseCircle,
  'information-circle': IoInformationCircle,
  close: IoClose,
  'chevron-right': IoChevronForward,
  check: IoCheckmark,
  'arrow-up': IoArrowUp,
  'arrow-down': IoArrowDown,
  settings: IoSettings,
  time: IoTime,
  menu: IoMenu,
  'trending-up': IoTrendingUp,
};

export function Icon({ name, size = 24, color = colors.textPrimary, style }: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`[Icon] Unknown icon name: ${name}`);
    return null;
  }

  return (
    <View style={style}>
      <IconComponent size={size} color={color} />
    </View>
  );
}
