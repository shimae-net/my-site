import fs from "node:fs";
import path from "node:path";

import { format } from "date-fns";
import { z } from "zod";

import { postFilenameSchema, postSlugSchema } from "./types.ts";

const CONTENT_DIR = "content/blog";
const postTemplate = fs.readFileSync("templates/post.md", "utf8");

const newPostInputSchema = z.object({
	slug: postSlugSchema,
	title: z.string().trim().min(1, "記事タイトルを指定してください。"),
});

const [slug, ...titleParts] = process.argv.slice(2);
const input = newPostInputSchema.safeParse({
	slug,
	title: titleParts.join(" "),
});

if (!input.success) {
	console.error('使い方: pnpm new:post <slug> "記事タイトル"');
	console.error(z.prettifyError(input.error));
	process.exitCode = 1;
} else {
	const now = new Date();
	const createdAt = format(now, "yyyy-MM-dd HH:mm");
	const prefix = format(now, "yyyyMMdd-HHmm");
	const fileName = `${prefix}--${input.data.slug}.md`;
	postFilenameSchema.parse(fileName);
	const filePath = path.join(CONTENT_DIR, fileName);

	if (fs.existsSync(filePath)) {
		console.error(`記事がすでに存在します: ${filePath}`);
		process.exitCode = 1;
	} else {
		const source = postTemplate
			.replaceAll("{{ createdAt }}", createdAt)
			.replaceAll("{{ title }}", JSON.stringify(input.data.title));

		fs.mkdirSync(CONTENT_DIR, { recursive: true });
		fs.writeFileSync(filePath, source, "utf8");

		console.log(`記事を作成しました: ${filePath}`);
	}
}
