import { useEffect } from "react";

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
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let element = document.querySelector(
        `meta[${attribute}="${name}"]`
      ) as HTMLMetaElement;

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.content = content;
    };

    // Standard meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Open Graph
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", ogImage, true);

    // Twitter
    updateMetaTag("twitter:title", title, true);
    updateMetaTag("twitter:description", description, true);
    updateMetaTag("twitter:image", ogImage, true);

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;

      if (!linkElement) {
        linkElement = document.createElement("link");
        linkElement.rel = "canonical";
        document.head.appendChild(linkElement);
      }

      linkElement.href = canonical;
    }

    // Robots
    const robotsContent = noIndex ? "noindex, nofollow" : "index, follow";
    updateMetaTag("robots", robotsContent);
  }, [title, description, keywords, ogImage, canonical, noIndex]);

  return null;
}
