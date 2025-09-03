"use client";

import { getPage, initLivePreview } from "@/lib/contentstack";
import { useEffect, useState } from "react";
import { Page } from "@/lib/types";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import DOMPurify from "dompurify";

export default function AboutPage() {
  const [page, setPage] = useState<Page>();

  const fetchAboutPage = async () => {
    try {
      const aboutPage = await getPage("/about");
      setPage(aboutPage);
    } catch (error) {
      console.error("Error fetching About page:", error);
    }
  };

  useEffect(() => {
    initLivePreview();
    ContentstackLivePreview.onEntryChange(fetchAboutPage);
    fetchAboutPage();
  }, []);

  if (!page) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading About page...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div 
        className="prose max-w-4xl mx-auto"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(page.rich_text || ''),
        }}
        {...(page?.$ && page?.$.rich_text)}
      />
    </main>
  );
}
