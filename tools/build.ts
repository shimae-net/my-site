import fs from "node:fs";
import path from "node:path";

import { format } from "date-fns";
import matter from "gray-matter";
import { marked } from "marked";

const CONTENT_DIR = "content/blog";
const OUTPUT_DIR = "dist";
const BLOG_OUTPUT_DIR = "dist/blog";

const articleTemplate = fs.readFileSync("templates/article.html", "utf8");
const indexTemplate = fs.readFileSync("templates/index.html", "utf8");

function creanOutput() {
	fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
	fs.mkdirSync(BLOG_OUTPUT_DIR, { recursive: true });
}

function loadPosts() {
	return fs
		.readdirSync(CONTENT_DIR)
		.filter((file) => file.endsWith(".md"))
		.map((file) => loadPost(file));
}

function loadPost(file) {
	const source = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");

	const { data, content } = matter(source);

	return {
		slug: path.basename(file, ".md"),
		title: data.title ?? "",
		description: data.description ?? "",
		date: data.date,
		content: content,
	};
}

async function buildArticle(post) {
	const content = await marked(post.content);

	const html = articleTemplate
		.replaceAll("{{ title }}", post.title ?? "")
		.replaceAll("{{ date }}", format(post.date, "yyyy/MM/dd") ?? "")
		.replaceAll("{{ description }}", post.description ?? "")
		.replace("{{ content }}", content);

	const outputDir = path.join(BLOG_OUTPUT_DIR, post.slug);

	fs.mkdirSync(outputDir, { recursive: true });
	fs.writeFileSync(path.join(outputDir, "index.html"), html);
}

function buildIndex(posts) {
	const postsHtml = posts
		.toSorted((a, b) => new Date(b.date) - new Date(a.date))
		.map(renderPostListItem)
		.join("");

	const html = indexTemplate.replace("{{ posts }}", postsHtml);

	fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), html);
}

function renderPostListItem(post) {
	return `
    <li>
      <a href="/blog/${post.slug}/">
        ${post.title}
      </a>
      <time datetime="${format(post.date, "yyyy-MM-dd")}">
        ${format(post.date, "yyyy/MM/dd HH:mm")}
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
