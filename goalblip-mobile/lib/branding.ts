// League icons - using static require (Metro bundler doesn't support dynamic require)
// Asset'ler mevcut olduğu için direkt statik require kullanıyoruz
let premierIcon: any = null;
let laligaIcon: any = null;
let bundesligaIcon: any = null;
let serieaIcon: any = null;
let ligue1Icon: any = null;

try {
  premierIcon = require('../assets/league-premier.png');
} catch (e) {
  console.warn('[Branding] Premier League icon not found');
}

try {
  laligaIcon = require('../assets/league-laliga.png');
} catch (e) {
  console.warn('[Branding] La Liga icon not found');
}

try {
  bundesligaIcon = require('../assets/league-bundesliga.png');
} catch (e) {
  console.warn('[Branding] Bundesliga icon not found');
}

try {
  serieaIcon = require('../assets/league-seriea.png');
} catch (e) {
  console.warn('[Branding] Serie A icon not found');
}

try {
  ligue1Icon = require('../assets/league-ligue1.png');
} catch (e) {
  console.warn('[Branding] Ligue 1 icon not found');
}

export const LEAGUE_ICONS: Record<string, any> = {
  'Premier League': premierIcon,
  'La Liga': laligaIcon,
  'Bundesliga': bundesligaIcon,
  'Serie A': serieaIcon,
  'Ligue 1': ligue1Icon,
};

export const DEFAULT_LEAGUE_ICON = premierIcon;

