import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 深度长文集合
const articles = defineCollection({
	loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			category: z.string(),
			tags: z.array(z.string()).default([]),
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
		}),
});

// 项目拆解集合
const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			category: z.string(),
			tags: z.array(z.string()).default([]),
			difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
			estimatedIncome: z.string().optional(), // 预估收入范围
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
		}),
});

// 学员故事集合
const stories = defineCollection({
	loader: glob({ base: './src/content/stories', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			heroImage: image().optional(),
			category: z.string(),
			author: z.string().optional(), // 故事主人公（可匿名）
			income: z.string().optional(), // 收益情况
			duration: z.string().optional(), // 用时多久
			tags: z.array(z.string()).default([]),
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
		}),
});

export const collections = { articles, projects, stories };

