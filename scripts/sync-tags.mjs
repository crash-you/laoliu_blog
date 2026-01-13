/**
 * 标签同步脚本
 * 扫描所有内容文件中的标签，输出统一的标签列表
 * 无需外部依赖
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const CONTENT_DIR = './src/content';

// 从 frontmatter 提取标签（使用正则）
function extractTags(content) {
    const tags = [];

    // 匹配 tags: [...] 或 tags: ['...', '...']
    const tagsMatch = content.match(/tags:\s*\[([\s\S]*?)\]/);
    if (tagsMatch) {
        const tagString = tagsMatch[1];
        // 提取引号内的内容
        const tagMatches = tagString.matchAll(/["']([^"']+)["']/g);
        for (const match of tagMatches) {
            tags.push(match[1]);
        }
    }

    // 匹配 customTags: [...] 
    const customTagsMatch = content.match(/customTags:\s*\[([\s\S]*?)\]/);
    if (customTagsMatch) {
        const tagString = customTagsMatch[1];
        const tagMatches = tagString.matchAll(/["']([^"']+)["']/g);
        for (const match of tagMatches) {
            tags.push(match[1]);
        }
    }

    return tags;
}

// 收集所有标签
async function collectAllTags() {
    const allTags = new Set();
    const collections = ['articles', 'projects', 'stories'];

    for (const collection of collections) {
        const collectionPath = join(CONTENT_DIR, collection);

        try {
            const files = await readdir(collectionPath);

            for (const file of files) {
                if (!file.endsWith('.md')) continue;

                const filePath = join(collectionPath, file);
                const content = await readFile(filePath, 'utf-8');

                const tags = extractTags(content);
                tags.forEach(tag => allTags.add(tag));
            }
        } catch (e) {
            console.warn(`⚠️  读取 ${collection} 目录失败:`, e.message);
        }
    }

    return Array.from(allTags).sort();
}

// 主函数
async function main() {
    console.log('🏷️  标签同步脚本');
    console.log('');

    console.log('📂 扫描内容目录...');
    const allTags = await collectAllTags();

    console.log(`📋 发现 ${allTags.length} 个唯一标签:`);
    allTags.forEach(tag => console.log(`   - ${tag}`));
    console.log('');

    // 保存标签到 JSON 文件供参考
    const tagsDir = './src/data';
    const tagsFile = './src/data/tags.json';

    try {
        await mkdir(tagsDir, { recursive: true });
        await writeFile(tagsFile, JSON.stringify(allTags, null, 2), 'utf-8');
        console.log(`💾 标签列表已保存到 ${tagsFile}`);
    } catch (e) {
        console.error('❌ 保存失败:', e.message);
    }

    console.log('');
    console.log('✅ 同步完成！');
    console.log('');
    console.log('📝 要将这些标签添加到 CMS 配置中，请复制以下内容到');
    console.log('   public/admin/config.yml 的 tags options 部分：');
    console.log('');
    allTags.forEach(tag => console.log(`          - "${tag}"`));
}

main().catch(console.error);
