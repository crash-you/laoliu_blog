/**
 * 自动 Git 提交脚本
 * 监听 src/content 目录的变化，自动提交并推送到 GitHub
 */

import { watch } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// 配置
const WATCH_DIR = './src/content';
const DEBOUNCE_MS = 5000; // 防抖时间：5秒内的多次变化合并为一次提交

let debounceTimer = null;
let pendingChanges = new Set();

console.log('🔄 自动提交脚本已启动');
console.log(`📁 监听目录: ${path.resolve(WATCH_DIR)}`);
console.log('');

// 执行 Git 命令
async function gitCommitAndPush() {
    const changedFiles = Array.from(pendingChanges);
    pendingChanges.clear();

    if (changedFiles.length === 0) return;

    console.log('📝 检测到内容变化，准备提交...');
    console.log(`   变化的文件: ${changedFiles.join(', ')}`);

    try {
        // git add
        await execAsync('git add src/content/ public/images/uploads/');
        console.log('✅ git add 完成');

        // 生成提交信息
        const timestamp = new Date().toLocaleString('zh-CN');
        const commitMsg = `📝 内容更新 (${timestamp})`;

        // git commit
        try {
            await execAsync(`git commit -m "${commitMsg}"`);
            console.log(`✅ git commit 完成: ${commitMsg}`);
        } catch (e) {
            // 如果没有变化需要提交，不是错误
            if (e.stderr && e.stderr.includes('nothing to commit')) {
                console.log('ℹ️  没有需要提交的变化');
                return;
            }
            throw e;
        }

        // git push
        console.log('🚀 正在推送到 GitHub...');
        await execAsync('git push');
        console.log('✅ git push 完成！网站将在1-2分钟后自动更新');
        console.log('');

    } catch (error) {
        console.error('❌ Git 操作失败:', error.message);
        if (error.stderr) {
            console.error('   详情:', error.stderr);
        }
        console.log('');
    }
}

// 防抖处理
function scheduleCommit(filename) {
    pendingChanges.add(filename);

    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        gitCommitAndPush();
        debounceTimer = null;
    }, DEBOUNCE_MS);
}

// 递归监听目录
function watchDirectory(dir) {
    watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // 忽略临时文件和隐藏文件
        if (filename.startsWith('.') || filename.endsWith('~')) return;

        console.log(`📄 文件变化: ${filename} (${eventType})`);
        scheduleCommit(filename);
    });
}

// 开始监听
watchDirectory(WATCH_DIR);

// 同时监听图片上传目录
try {
    watchDirectory('./public/images/uploads');
} catch (e) {
    // 目录可能不存在，忽略
}

console.log('⏳ 等待文件变化...');
console.log('   (在后台发布文章后，将自动提交并推送)');
console.log('');
