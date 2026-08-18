import fs from "node:fs";
import path from "node:path";

import { format } from "date-fns";
import { marked } from "marked";
import { ZodError, z } from "zod";
import { parse } from "zod-matter";

import { type Post, postFrontMatterSchema } from "./types.ts";

const CONTENT_DIR = "content/blog";
const OUTPUT_DIR = "dist";
const BLOG_OUTPUT_DIR = "dist/blog";

const articleTemplate = fs.readFileSync("templates/article.html", "utf8");
const indexTemplate = fs.readFileSync("templates/index.html", "utf8");

function creanOutput() {
	fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
	fs.mkdirSync(BLOG_OUTPUT_DIR, { recursive: true });
}

function parseFrontMatter<T extends z.ZodType>(
	source: string,
	schema: T,
	filePath: string,
) {
	try {
		return parse(source, schema);
	} catch (error) {
		if (error instanceof ZodError) {
			throw new Error(
				`${filePath} の front matter が不正です。\n${z.prettifyError(error)}`,
			);
		}

		throw error;
	}
}

function loadPosts(): Post[] {
	return fs
		.readdirSync(CONTENT_DIR)
		.filter((file) => file.endsWith(".md"))
		.map((file) => loadPost(file));
}

function loadPost(file): Post {
	const filePath = path.join(CONTENT_DIR, file);
	const source = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");

	const { data, content } = parseFrontMatter(
		source,
		postFrontMatterSchema,
		filePath,
	);

	return {
		slug: path.basename(file, ".md"),
		...data,
		content: content,
	};
}

async function buildArticle(post: Post) {
	const content = await marked(post.content);

	const html = articleTemplate
		.replaceAll("{{ title }}", post.title ?? "")
		.replaceAll("{{ createdAt }}", format(post.createdAt, "yyyy/MM/dd") ?? "")
		.replaceAll("{{ description }}", post.description ?? "")
		.replace("{{ content }}", content);

	const outputDir = path.join(BLOG_OUTPUT_DIR, post.slug);

	fs.mkdirSync(outputDir, { recursive: true });
	fs.writeFileSync(path.join(outputDir, "index.html"), html);
}

function buildIndex(posts: Post[]) {
	const postsHtml = posts
		.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.map(renderPostListItem)
		.join("");

	const html = indexTemplate.replace("{{ posts }}", postsHtml);

	fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), html);
}

function renderPostListItem(post: Post) {
	return `
    <li>
      <a href="/blog/${post.slug}/">
        ${post.title}
      </a>
		<time datetime="${format(post.createdAt, "yyyy-MM-dd")}">
		${format(post.createdAt, "yyyy/MM/dd HH:mm")}
      </time>
    </li>
  `;
}

function copyPublic() {
	fs.cpSync("public", OUTPUT_DIR, { recursive: true });
}

async function main() {
	creanOutput();

	const posts = loadPosts();

	for (const post of posts) {
		await buildArticle(post);
	}

	buildIndex(posts);
	copyPublic();

	console.log("Build complete.");
}

await main();
