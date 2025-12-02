/* ============================================
   CONFIG - API URL og stillingar
   ============================================ */

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxcBNvjW3jc_Q1tmk7EVQ84YHVQcmi7GnbQknhs1ecOQuZqiNepB_GCv6Rhh6An7qDK3Q/exec';
const API_URL = WEB_APP_URL;

const CENTER_STYLES = {
  'HAFNOFELO': { 
    color: '#8B5CF6', 
    name: 'Fjör Hafnó',
    colorClass: 'rainbow',
    schools: 'MyllubakkaskÓli • NjarðvÍkurskÓli • HeiðarskÓli • HoltaskÓli'
  },
  'STAPAFELO': { 
    color: '#8B5CF6', 
    name: 'Fjör Stapa',
    colorClass: 'purple',
    schools: 'StapaskÓli'
  },
  'AKURFELO': { 
    color: '#EAB308', 
    name: 'Fjör Akur',
    colorClass: 'yellow',
    schools: 'AkurskÓli'
  },
  'HAALEITIFELO': { 
    color: '#EC4899', 
    name: 'Fjör Háaleiti',
    colorClass: 'pink',
    schools: 'HáaleitisskÓli'
  }
};

const SCHOOLS = [
  'AkurskÓli', 
  'StapaskÓli', 
  'HáaleitisskÓli', 
  'MyllubakkaskÓli',
  'NjarðvÍkurskÓli', 
  'HeiðarskÓli', 
  'HoltaskÓli'
];

const TITLES = [
  { min: 1, max: 4, name: 'NÝliði' },
  { min: 5, max: 9, name: 'FjörgÆðingur' },
  { min: 10, max: 24, name: 'Fjörvinur' },
  { min: 25, max: 49, name: 'Fjörstjarna' },
  { min: 50, max: 99, name: 'Fjörhetja' },
  { min: 100, max: 999999, name: 'Fjörmeistari' }
];

const MILESTONES = {
  1: 'Velkomin/n Í FjörlistannÍ 🎉',
  10: 'TÍu mÆtingar! ÞÚ ert komin/n vel af stað! 🌟',
  25: 'Tuttugu og fimm! ÞÚ ert alvöru Fjörvinur! ⭐',
  50: 'FimmtÍu mÆtingar! Ótrúlegt! 🏆',
  75: 'SjötÍu og fimm! ÞÚ ert legend! 💎',
  100: 'HUNDRAÐ MÆTINGAR! ÞÚ ert Fjörmeistari! 👑'
};

const ACHIEVEMENTS = {
  'first_timer': { emoji: '🌟', name: 'Frumherji' },
  'streak_master': { emoji: '🔥', name: 'Eldheitur' },
  'streak_legend': { emoji: '💎', name: 'Goðsögn' },
  'night_owl': { emoji: '🦉', name: 'Náttugla' },
  'early_bird': { emoji: '🐦', name: 'SnemmbÚinn' },
  'social_butterfly': { emoji: '🦋', name: 'FélagsfÍll' },
  'loyal_fan': { emoji: '💜', name: 'Tryggðarvinur' },
  'weekend_warrior': { emoji: '⚔️', name: 'Helgarkempa' },
  'explorer': { emoji: '🌍', name: 'Landkönnuður' },
  'century_club': { emoji: '💯', name: 'Öldungur' }
};

const monthNames = [
  'JanÚar', 'FebrÚar', 'Mars', 'AprÍl', 'MaÍ', 'JÚnÍ',
  'JÚlÍ', 'ÁgÚst', 'September', 'OktÓber', 'NÓvember', 'Desember'
];

const dayNames = ['Sunnudagur', 'Mánudagur', 'Þriðjudagur', 'Miðvikudagur', 'Fimmtudagur', 'Föstudagur', 'Laugardagur'];

console.log('Config.js loaded!');
