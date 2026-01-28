'use client';

import { useState } from 'react';
import type { Provider } from '@/lib/types';
import ProviderCard from './ProviderCard';

interface ProviderWithLetter {
  provider: Provider;
  letter: string | null;
}

export default function ProviderList({ providersWithLetters }: { providersWithLetters: ProviderWithLetter[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {providersWithLetters.map(({ provider, letter }) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          letter={letter}
          isOpen={openId === provider.id}
          onToggle={() => setOpenId(openId === provider.id ? null : provider.id)}
        />
      ))}
    </div>
  );
}
