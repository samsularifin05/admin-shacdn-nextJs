import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

export function SEO({
  title = "Shadcn Admin - Modern Admin Dashboard",
  description = "Modern admin dashboard built with React, TypeScript, Tailwind CSS, and shadcn/ui",
  keywords = "admin dashboard, react, typescript, tailwind css, shadcn ui",
  ogImage = "https://yourdomain.com/og-image.png",
  canonical,
  noIndex = false,
}: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Shadcn Admin" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  );
}
