import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	// 获取所有文章和项目
	const articles = await getCollection('articles', ({ data }) => !data.draft);
	const projects = await getCollection('projects', ({ data }) => !data.draft);

	// 合并所有内容
	const allContent = [
		...articles.map(post => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/articles/${post.id}/`,
		})),
		...projects.map(post => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/projects/${post.id}/`,
		})),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: allContent,
	});
}
