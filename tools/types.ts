import { z } from "zod";

z.config(z.locales.ja());

export const postFrontMatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	createdAt: z.union([z.date(), z.string().min(1)]).pipe(z.coerce.date()),
	updatedAt: z
		.union([z.date(), z.string().min(1)])
		.pipe(z.coerce.date())
		.optional(),
});

export const postSchema = postFrontMatterSchema.extend({
	slug: z.string().min(1),
	content: z.string(),
});

export type Post = z.output<typeof postSchema>;
