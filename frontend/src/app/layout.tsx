import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EmergencyBar from '@/components/EmergencyBar'
import { SearchProvider } from '@/components/search/SearchProvider'
import SearchModal from '@/components/search/SearchModal'
import { getAllSearchableContent } from '@/lib/strapi'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Průvodce sociálními službami Příbor',
  description: 'Informační portál sociálních služeb pro občany města Příbor',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchContent = await getAllSearchableContent();

  return (
    <html lang="cs">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SearchProvider initialContent={searchContent}>
          <EmergencyBar />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <SearchModal />
        </SearchProvider>
      </body>
    </html>
  )
}
