import { getCrisisLines } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Krizové linky | Průvodce sociálními službami Příbor',
  description: 'Seznam krizových linek a telefonických poraden pro občany v nouzi.',
};

export default async function CrisisLinesPage() {
  const crisisLines = await getCrisisLines();

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="icon-box icon-box-secondary icon-box-lg mx-auto mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-heading text-stone-900 mb-4">
            Krizové linky
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            V náročné situaci se můžete obrátit na tyto linky. Většina je dostupná 24 hodin denně.
          </p>
        </div>

        {/* Crisis Lines List */}
        <div className="space-y-5">
          {crisisLines.map((line) => (
            <div
              key={line.id}
              className="card"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon */}
                <div className="icon-box icon-box-secondary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <h2 className="text-xl font-bold text-stone-900">
                      {line.name}
                    </h2>
                    {line.phone && (
                      <a
                        href={`tel:${line.phone}`}
                        className="btn-secondary text-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {line.phone}
                      </a>
                    )}
                  </div>

                  {line.description && (
                    <p className="text-stone-600 mb-4 leading-relaxed">{line.description}</p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {line.availability && (
                      <span className="badge-success">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {line.availability}
                      </span>
                    )}
                    {line.free && (
                      <span className="badge-success">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Volání zdarma
                      </span>
                    )}
                    {line.targetGroup && (
                      <span className="badge bg-stone-100 text-stone-700">
                        {line.targetGroup}
                      </span>
                    )}
                  </div>

                  {/* Additional Contact Info */}
                  {(line.email || line.website) && (
                    <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap gap-4 text-sm">
                      {line.email && (
                        <a
                          href={`mailto:${line.email}`}
                          className="inline-flex items-center text-stone-600 hover:text-primary-600 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {line.email}
                        </a>
                      )}
                      {line.website && (
                        <a
                          href={line.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-stone-600 hover:text-primary-600 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Web
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
