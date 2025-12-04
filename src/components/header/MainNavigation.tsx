import React from 'react';
export const MainNavigation = () => {
  const sections = [{
    id: 'daynews',
    title: 'Day',
    subtitle: 'News',
    url: 'https://www.day.news',
    bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
    hoverColor: 'hover:from-red-100 hover:to-pink-100',
    borderColor: 'border-red-300',
    titleColor: 'text-slate-800',
    subtitleColor: 'text-red-600'
  }, {
    id: 'goeventcity',
    title: 'Go',
    subtitle: 'Event City',
    url: 'https://www.goeventcity.com',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    hoverColor: 'hover:from-emerald-100 hover:to-teal-100',
    borderColor: 'border-emerald-300',
    titleColor: 'text-slate-800',
    subtitleColor: 'text-emerald-700',
    subtitleStyle: 'italic'
  }, {
    id: 'downtownsguide',
    title: 'Downtowns',
    subtitle: 'Guide',
    url: 'https://www.downtownsguide.com',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
    hoverColor: 'hover:from-orange-100 hover:to-amber-100',
    borderColor: 'border-orange-300',
    titleColor: 'text-slate-800',
    subtitleColor: 'text-orange-600'
  }, {
    id: 'alphasite',
    title: 'AlphaSite',
    url: 'https://www.alphasite.ai',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    hoverColor: 'hover:from-indigo-100 hover:to-purple-100',
    borderColor: 'border-indigo-300',
    titleColor: 'text-indigo-600'
  }, {
    id: 'golocalvoices',
    title: 'Go Local',
    subtitle: 'Voices',
    url: 'https://www.golocalvoices.com',
    bgColor: 'bg-gradient-to-br from-violet-50 to-fuchsia-50',
    hoverColor: 'hover:from-violet-100 hover:to-fuchsia-100',
    borderColor: 'border-violet-300',
    titleColor: 'text-slate-800',
    subtitleColor: 'text-violet-700',
    subtitleStyle: 'italic'
  }];
  return <div className="bg-white shadow-inner">
      <div className="flex items-stretch">
        {sections.map(section => <a key={section.id} href={section.url} target="_blank" rel="noopener noreferrer" className={`flex-1 border-r-2 border-slate-200 last:border-r-0 h-32 px-6 ${section.bgColor} ${section.hoverColor} transition-all duration-200 flex flex-col items-center justify-center border-b-4 ${section.borderColor} group`}>
            <span className={`text-4xl font-black ${section.titleColor} group-hover:scale-105 transition-transform duration-200 leading-tight`}>
              {section.title}
            </span>
            {section.subtitle && <span className={`text-4xl font-black ${section.subtitleColor} ${section.subtitleStyle || ''} group-hover:scale-105 transition-transform duration-200 leading-tight`}>
                {section.subtitle}
              </span>}
          </a>)}
      </div>
    </div>;
};