"use client";

import { getPage, initLivePreview } from "@/lib/contentstack";
import { useEffect, useState } from "react";
import { Page } from "@/lib/types";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import DOMPurify from "dompurify";

export default function HelpPage() {
  const [page, setPage] = useState<Page>();

  const fetchHelpPage = async () => {
    try {
      const helpPage = await getPage("/help");
      setPage(helpPage);
    } catch (error) {
      console.error("Error fetching Help page:", error);
    }
  };

  useEffect(() => {
    initLivePreview();
    ContentstackLivePreview.onEntryChange(fetchHelpPage);
    fetchHelpPage();
  }, []);

  if (!page) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Help page...</p>
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
