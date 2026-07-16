import React from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

// Maps category IDs to relevant Lucide React icons
const iconMap = {
  morning: 'Sun',
  evening: 'Moon',
  wudu: 'Droplets',
  prayer: 'Heart',
  after_prayer: 'CheckSquare',
  sleep: 'Bed',
  food: 'Utensils',
  travel: 'Compass',
  home: 'Home',
  masjid: 'BookOpen',
  distress: 'AlertTriangle',
  forgiveness: 'ShieldAlert',
  illness: 'Activity',
  weather: 'CloudRain',
  knowledge: 'GraduationCap',
  parents: 'HeartHandshake',
  guidance: 'Compass',
  gratitude: 'ThumbsUp',
  protection: 'Shield',
  dhikr: 'Infinity',
  marriage: 'Heart',
  hajj: 'Map',
  grief: 'Frown',
  children: 'Baby',
  business: 'Briefcase',
  night_prayer: 'Stars',
  quran_recitation: 'Book',
};

/**
 * Grid Card representing an Adhkar category.
 * Incorporates category-specific icons, a count badge, description, and premium micro-interactions.
 */
export const AdhkarCard = ({ category }) => {
  // Safe lookup for the icon, fallback to BookOpen if not found
  const iconName = iconMap[category.id] || 'BookOpen';
  const IconComponent = LucideIcons[iconName] || LucideIcons.BookOpen;

  return (
    <Link
      to={`/adhkar/${category.id}`}
      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:shadow-slate-100/50 hover:border-teal-500/20 active:scale-[0.98] group flex flex-col justify-between h-36 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer relative"
    >
      {/* Decorative subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0E7C66]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Top row: Icon and Count Badge */}
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-teal-50 text-[#0E7C66] rounded-xl group-hover:bg-[#0E7C66] group-hover:text-white transition-all duration-300">
          <IconComponent className="h-5 w-5" />
        </div>
        
        <span className="bg-slate-50 text-slate-500 group-hover:bg-teal-50 group-hover:text-[#0E7C66] font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-slate-100 group-hover:border-teal-100 transition-colors uppercase tracking-wider">
          {category.count}
        </span>
      </div>

      {/* Bottom row: Text Details */}
      <div className="mt-3.5 space-y-1">
        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0E7C66] transition-colors truncate">
          {category.name}
        </h4>
        <p className="text-slate-400 text-[11px] font-medium leading-relaxed line-clamp-1">
          {category.description}
        </p>
      </div>
    </Link>
  );
};

export default AdhkarCard;
