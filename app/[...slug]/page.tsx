"use client"; // This directive indicates that the code is meant to run on the client side and the server side

import DOMPurify from "dompurify";
import Image from "next/image"; // Importing the Image component from Next.js for optimized image rendering
import { getPage, initLivePreview } from "@/lib/contentstack"; // Importing functions to get page data and initialize live preview from a local library
import { useEffect, useState, useCallback } from "react"; // Importing React hooks for side effects and state management
import { Page } from "@/lib/types"; // Importing the Page type definition from a local types file
import ContentstackLivePreview, {
    VB_EmptyBlockParentClass,
} from "@contentstack/live-preview-utils"; // Importing live preview utilities from Contentstack
import { useParams } from "next/navigation"; // Importing useParams to get the current route parameters
import Link from "next/link"; // Importing Link for navigation

/**
 * The `DynamicPage` component handles all dynamic routes in the application.
 * It fetches and displays content from Contentstack based on the URL path,
 * including the page title, description, image, rich text, and blocks.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * This component uses the `useState` and `useEffect` hooks to manage state and side effects.
 * It initializes live preview functionality and listens for entry changes to update the content.
 */
export default function DynamicPage() {
    const [page, setPage] = useState<Page>(); // Declaring a state variable 'page' with its setter 'setPage', initially undefined
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state
    const params = useParams(); // Getting the current route parameters

    const getContent = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Construct the URL from the slug parameters
            const slug = params?.slug;
            const url = Array.isArray(slug)
                ? `/${slug.join("/")}`
                : `/${slug || ""}`;

            const pageData = await getPage(url); // Asynchronously fetching page data for the current URL

            if (!pageData) {
                setError("Page not found");
                return;
            }

            setPage(pageData); // Updating the state with the fetched page data
        } catch (err) {
            setError("Failed to load page");
            console.error("Error fetching page:", err);
        } finally {
            setLoading(false);
        }
    }, [params?.slug]);

    useEffect(() => {
        initLivePreview(); // Initializing live preview functionality
        ContentstackLivePreview.onEntryChange(getContent); // Setting up an event listener to fetch content on entry change
        getContent(); // Fetch content on component mount
    }, [params?.slug, getContent]); // Re-fetch when the slug changes

    // Show loading state
    if (loading) {
        return (
            <main className="max-w-(--breakpoint-md) mx-auto">
                <section className="p-4">
                    <div className="text-center">
                        <p>Loading...</p>
                    </div>
                </section>
            </main>
        );
    }

    // Show error state
    if (error) {
        return (
            <main className="max-w-(--breakpoint-md) mx-auto">
                <section className="p-4">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">404</h1>
                        <p className="text-lg">{error}</p>
                        <p className="mt-4">
                            <Link
                                href="/"
                                className="text-blue-600 hover:underline"
                            >
                                Go back to home
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="max-w-(--breakpoint-md) mx-auto">
            {/* Main container with max width and centered alignment */}
            <section className="p-4">
                {/* Section with padding */}
                {page?.title ? (
                    <h1
                        className="text-4xl font-bold mb-4 text-center"
                        {...(page?.$ && page?.$.title)} // Adding editable tags if available
                    >
                        {page?.title} {/* Rendering the page title */}
                    </h1>
                ) : null}
                {page?.description ? (
                    <p
                        className="mb-4 text-center"
                        {...(page?.$ && page?.$.description)}
                    >
                        {/* Adding editable tags if available */}
                        {page?.description}{" "}
                        {/* Rendering the page description */}
                    </p>
                ) : null}
                {page?.image ? (
                    <Image
                        className="mb-4"
                        width={768}
                        height={414}
                        src={page?.image.url}
                        alt={page?.image.title}
                        {...(page?.image?.$ && page?.image?.$.url)} // Adding editable tags if available
                    />
                ) : null}
                {page?.rich_text ? (
                    <div
                        {...(page?.$ && page?.$.rich_text)} // Adding editable tags if available
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(page?.rich_text),
                        }} // Rendering rich text content as HTML
                        className="prose max-w-none"
                    />
                ) : null}
                <div
                    className={`space-y-8 max-w-full mt-4 ${
                        !page?.blocks || page.blocks.length === 0
                            ? VB_EmptyBlockParentClass // Adding a class if no blocks are present
                            : ""
                    }`}
                    {...(page?.$ && page?.$.blocks)} // Adding editable tags if available
                >
                    {page?.blocks?.map((item, index) => {
                        const { block } = item;
                        const isImageLeft = block.layout === "image_left"; // Checking the layout of the block

                        return (
                            <div
                                key={block._metadata.uid}
                                {...(page?.$ && page?.$[`blocks__${index}`])} // Adding editable tags if available
                                className={`flex flex-col md:flex-row items-center space-y-4 md:space-y-0 bg-white ${
                                    isImageLeft
                                        ? "md:flex-row"
                                        : "md:flex-row-reverse" // Adjusting the layout based on the block's layout property
                                }`}
                            >
                                <div className="w-full md:w-1/2">
                                    {block.image ? (
                                        <Image
                                            key={`image-${block._metadata.uid}`}
                                            src={block.image.url}
                                            alt={block.image.title}
                                            width={200}
                                            height={112}
                                            className="w-full"
                                            {...(block?.$ && block?.$.image)} // Adding editable tags if available
                                        />
                                    ) : null}
                                </div>
                                <div className="w-full md:w-1/2 p-4">
                                    {block.title ? (
                                        <h2
                                            className="text-2xl font-bold"
                                            {...(block?.$ && block?.$.title)} // Adding editable tags if available
                                        >
                                            {block.title}{" "}
                                            {/* Rendering the block title */}
                                        </h2>
                                    ) : null}
                                    {block.copy ? (
                                        <div
                                            {...(block?.$ && block?.$.copy)} // Adding editable tags if available
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(
                                                    block.copy
                                                ),
                                            }} // Rendering block copy as HTML
                                            className="prose"
                                        />
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
