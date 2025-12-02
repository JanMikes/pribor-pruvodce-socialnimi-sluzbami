'use client';

import { healthcareCategoryLabels, type HealthcareCategory } from '@/lib/types';

interface CategoryNavigationProps {
  categories: HealthcareCategory[];
  counts: Record<HealthcareCategory, number>;
}

export default function CategoryNavigation({ categories, counts }: CategoryNavigationProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    e.preventDefault();
    const element = document.getElementById(category);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-12 flex flex-wrap gap-2">
      {categories.map((category) => (
        <a
          key={category}
          href={`#${category}`}
          onClick={(e) => handleClick(e, category)}
          className="px-4 py-2 bg-surface rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-healthcare-50 hover:border-healthcare-200 hover:text-healthcare-700 transition-all shadow-sm"
        >
          {healthcareCategoryLabels[category]} ({counts[category]})
        </a>
      ))}
    </div>
  );
}
