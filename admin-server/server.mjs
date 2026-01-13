/**
 * 自定义管理后台服务器
 * 提供内容管理 API，支持批量删除、草稿管理等功能
 */

import express from 'express';
import { readdir, readFile, writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const CONTENT_DIR = join(__dirname, '..', 'src', 'content');
const UPLOAD_DIR = join(__dirname, '..', 'public', 'images', 'uploads');

// 中间件
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// 解析 frontmatter
function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: content };

    const frontmatterStr = match[1];
    const body = match[2];
    const frontmatter = {};

    // 简单解析 YAML
    frontmatterStr.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();

        // 处理数组
        if (value.startsWith('[') && value.endsWith(']')) {
            const arrContent = value.slice(1, -1);
            value = arrContent ? arrContent.split(',').map(v =>
                v.trim().replace(/^["']|["']$/g, '')
            ) : [];
        }
        // 处理布尔值
        else if (value === 'true') value = true;
        else if (value === 'false') value = false;
        // 处理引号包裹的字符串
        else if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        frontmatter[key] = value;
    });

    return { frontmatter, body };
}

// 生成 frontmatter
function generateFrontmatter(data) {
    let result = '---\n';
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            result += `${key}: [${value.map(v => `"${v}"`).join(', ')}]\n`;
        } else if (typeof value === 'boolean') {
            result += `${key}: ${value}\n`;
        } else if (typeof value === 'string' && value.includes(':')) {
            result += `${key}: "${value}"\n`;
        } else {
            result += `${key}: ${value}\n`;
        }
    }
    result += '---\n\n';
    return result;
}

// API: 获取所有内容
app.get('/api/content', async (req, res) => {
    try {
        const collections = ['articles', 'projects', 'stories'];
        const allContent = [];

        for (const collection of collections) {
            const collectionPath = join(CONTENT_DIR, collection);
            if (!existsSync(collectionPath)) continue;

            const files = await readdir(collectionPath);

            for (const file of files) {
                if (!file.endsWith('.md')) continue;

                const filePath = join(collectionPath, file);
                const content = await readFile(filePath, 'utf-8');
                const { frontmatter, body } = parseFrontmatter(content);

                allContent.push({
                    id: `${collection}/${file}`,
                    collection,
                    slug: file.replace('.md', ''),
                    filename: file,
                    ...frontmatter,
                    bodyPreview: body.slice(0, 200) + (body.length > 200 ? '...' : '')
                });
            }
        }

        // 按日期排序
        allContent.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(allContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: 获取单篇内容
app.get('/api/content/:collection/:slug', async (req, res) => {
    try {
        const { collection, slug } = req.params;
        const filePath = join(CONTENT_DIR, collection, `${slug}.md`);

        if (!existsSync(filePath)) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const content = await readFile(filePath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);

        res.json({
            id: `${collection}/${slug}.md`,
            collection,
            slug,
            ...frontmatter,
            body
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: 创建/更新内容
app.post('/api/content/:collection/:slug', async (req, res) => {
    try {
        const { collection, slug } = req.params;
        const { title, description, date, tags, customTags, draft, subCategory, pinned, cover, body } = req.body;

        const collectionPath = join(CONTENT_DIR, collection);
        if (!existsSync(collectionPath)) {
            await mkdir(collectionPath, { recursive: true });
        }

        const frontmatter = {
            title: title || 'Untitled',
            description: description || '',
            date: date || new Date().toISOString(),
            subCategory: subCategory || '其他',
            pinned: pinned || false,
            cover: cover || '',
            tags: tags || [],
            customTags: customTags || [],
            draft: draft !== undefined ? draft : false
        };

        const content = generateFrontmatter(frontmatter) + (body || '');
        const filePath = join(collectionPath, `${slug}.md`);

        await writeFile(filePath, content, 'utf-8');

        // 自动 Git 提交
        await gitCommit(`更新内容: ${title}`);

        res.json({ success: true, id: `${collection}/${slug}.md` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: 删除单个内容
app.delete('/api/content/:collection/:slug', async (req, res) => {
    try {
        const { collection, slug } = req.params;
        const filePath = join(CONTENT_DIR, collection, `${slug}.md`);

        if (!existsSync(filePath)) {
            return res.status(404).json({ error: 'Content not found' });
        }

        await unlink(filePath);
        await gitCommit(`删除内容: ${slug}`);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: 批量删除
app.post('/api/content/batch-delete', async (req, res) => {
    try {
        const { items } = req.body; // [{collection, slug}, ...]

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Invalid items array' });
        }

        const deleted = [];
        const failed = [];

        for (const item of items) {
            const filePath = join(CONTENT_DIR, item.collection, `${item.slug}.md`);
            try {
                if (existsSync(filePath)) {
                    await unlink(filePath);
                    deleted.push(item);
                } else {
                    failed.push({ ...item, reason: 'Not found' });
                }
            } catch (err) {
                failed.push({ ...item, reason: err.message });
            }
        }

        if (deleted.length > 0) {
            await gitCommit(`批量删除 ${deleted.length} 篇内容`);
        }

        res.json({ success: true, deleted: deleted.length, failed });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: 批量更新草稿状态
app.post('/api/content/batch-draft', async (req, res) => {
    try {
        const { items, draft } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Invalid items array' });
        }

        const updated = [];

        for (const item of items) {
            const filePath = join(CONTENT_DIR, item.collection, `${item.slug}.md`);
            if (!existsSync(filePath)) continue;

            const content = await readFile(filePath, 'utf-8');
            const { frontmatter, body } = parseFrontmatter(content);
            frontmatter.draft = draft;

            const newContent = generateFrontmatter(frontmatter) + body;
            await writeFile(filePath, newContent, 'utf-8');
            updated.push(item);
        }

        if (updated.length > 0) {
            await gitCommit(`批量${draft ? '设为草稿' : '发布'} ${updated.length} 篇内容`);
        }

        res.json({ success: true, updated: updated.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: 获取标签列表
app.get('/api/tags', async (req, res) => {
    try {
        const tagsFile = join(__dirname, '..', 'src', 'data', 'tags.json');
        if (existsSync(tagsFile)) {
            const tags = JSON.parse(await readFile(tagsFile, 'utf-8'));
            res.json(tags);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Git 提交函数
async function gitCommit(message) {
    try {
        const projectDir = join(__dirname, '..');
        await execAsync('git add .', { cwd: projectDir });
        await execAsync(`git commit -m "${message}"`, { cwd: projectDir });
        await execAsync('git push', { cwd: projectDir });
        console.log(`✅ Git 推送成功: ${message}`);
    } catch (error) {
        console.log(`⚠️ Git 操作: ${error.message}`);
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('   🚀 自定义管理后台已启动');
    console.log('========================================');
    console.log('');
    console.log(`   访问地址: http://localhost:${PORT}`);
    console.log('');
    console.log('   功能支持:');
    console.log('   ✓ 内容增删改查');
    console.log('   ✓ 批量删除');
    console.log('   ✓ 草稿管理');
    console.log('   ✓ GitHub 自动同步');
    console.log('');
    console.log('========================================');
});
