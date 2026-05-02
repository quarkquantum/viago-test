import slugify from 'slugify';

type MetadataProps = {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  shouldSlugify?: boolean;
};

export function constructMetadata({
  title = 'Viago',
  description = 'Viago Dashboard',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = false,
  shouldSlugify = false,
}: MetadataProps): any {
  const formattedTitle = shouldSlugify ? slugify(title, { lower: true }) : title;
  // Note: Most apps use a template in layout.tsx, so this helper is for manual overrides or complex metadata.
  const finalTitle = `${formattedTitle} - Viago`;

  return {
    title: finalTitle,
    description,
    openGraph: {
      title: finalTitle,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description,
      images: [image],
      creator: '@viago',
    },
    icons,
    metadataBase: new URL('https://viago.com'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
