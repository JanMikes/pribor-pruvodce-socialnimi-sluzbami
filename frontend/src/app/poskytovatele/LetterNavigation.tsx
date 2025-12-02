'use client';

interface LetterNavigationProps {
  letters: string[];
}

export default function LetterNavigation({ letters }: LetterNavigationProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, letter: string) => {
    e.preventDefault();
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      const headerOffset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {letters.map((letter) => (
        <a
          key={letter}
          href={`#letter-${letter}`}
          onClick={(e) => handleClick(e, letter)}
          className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          {letter}
        </a>
      ))}
    </div>
  );
}
