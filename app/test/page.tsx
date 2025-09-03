"use client";

import { getPage, initLivePreview } from "@/lib/contentstack";
import { useEffect, useState } from "react";
import { Page } from "@/lib/types";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import DOMPurify from "dompurify";

export default function TestPage() {
  const [page, setPage] = useState<Page>();
  const [environment, setEnvironment] = useState<string>('Unknown');

  const fetchTestPage = async () => {
    try {
      const testPage = await getPage("/test");
      setPage(testPage);
      
      // Detect environment
      if (process.env.NODE_ENV === 'development') {
        setEnvironment('Development');
      } else if (process.env.NODE_ENV === 'production') {
        setEnvironment('Production');
      } else {
        setEnvironment('Staging/Preview');
      }
    } catch (error) {
      console.error("Error fetching Test page:", error);
    }
  };

  useEffect(() => {
    initLivePreview();
    ContentstackLivePreview.onEntryChange(fetchTestPage);
    fetchTestPage();
  }, []);

  if (!page) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Test page...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-blue-100 p-4 rounded-lg mb-6">
        <p className="text-blue-800 font-bold">
          Current Environment: {environment}
        </p>
      </div>
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
