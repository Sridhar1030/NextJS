"use client";

import { useState, useEffect } from "react";
import { stack } from "@/lib/contentstack";
import Link from "next/link";

interface BlogPost {
	uid: string;
	title: string;
	url: string;
	description?: string;
	rich_text?: string;
}

export default function BlogPage() {
	const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchBlogPosts() {
			try {
				setLoading(true);

				const result = await stack
					.contentType("page")
					.entry()
					.query()
					.find();

				// ✅ result[0] contains entries
				const entries = result?.[0] || [];

				const blogEntries: BlogPost[] = entries
					.filter(
						(entry: any) =>
							entry.url?.startsWith("/blog/") &&
							entry.url !== "/blog"
					)
					.map((entry: any) => ({
						uid: entry.uid,
						title: entry.title,
						url: entry.url,
						description: entry.description,
						rich_text: entry.rich_text,
					}));

				setBlogPosts(blogEntries);
			} catch (err) {
				console.error("Error fetching blog posts:", err);
				setError("Failed to load blog posts");
			} finally {
				setLoading(false);
			}
		}

		fetchBlogPosts();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8 text-center text-red-500">
				{error}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 py-12">
			<div className="container mx-auto px-4">
				<h1 className="text-4xl font-bold mb-8 text-center text-blue-900">Blog Posts</h1>
				{blogPosts.length === 0 ? (
					<p className="text-gray-600 text-center">No blog posts found.</p>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{blogPosts.map((post) => (
							<div
								key={post.uid}
								className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow transform hover:-translate-y-2"
							>
								<h2 className="text-2xl font-semibold mb-3 text-blue-800">
									{post.title}
								</h2>
								<p className="text-gray-600 mb-4 line-clamp-3">
									{post.description || "No preview available"}
								</p>
								<Link
									href={post.url}
									className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
								>
									Read More
								</Link>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
