import { defineCollection, z } from 'astro:content';

// 深度长文集合
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    subCategory: z.string().default('其他'),
    customSubCategory: z.string().optional(), // 自定义分类
    pinned: z.boolean().default(false),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    customTags: z.array(z.string()).default([]), // 自定义标签
    draft: z.boolean().default(false),
  }),
});

// 项目拆解集合
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    subCategory: z.string().default('其他'),
    customSubCategory: z.string().optional(),
    pinned: z.boolean().default(false),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    customTags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// 学员故事集合
const stories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    pinned: z.boolean().default(false),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    customTags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, projects, stories };
