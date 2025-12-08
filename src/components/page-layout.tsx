import { ReactNode } from "react";
import { SEO } from "@/components/seo";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  noIndex?: boolean;
}

export function PageLayout({
  children,
  title,
  description,
  keywords,
  noIndex = true, // Default to noIndex for protected pages
}: PageLayoutProps) {
  return (
    <>
      {title && (
        <SEO
          title={title}
          description={description}
          keywords={keywords}
          noIndex={noIndex}
        />
      )}
      {children}
    </>
  );
}
