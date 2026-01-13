/**
 * 管理后台前端逻辑
 */

const API_BASE = 'http://localhost:3001/api';

// 状态
let allContent = [];
let selectedItems = new Set();
let currentFilter = 'all';
let currentEditItem = null;
let availableTags = [];

// DOM 元素
const listView = document.getElementById('listView');
const editView = document.getElementById('editView');
const listBody = document.getElementById('listBody');
const batchBar = document.getElementById('batchBar');
const selectedCount = document.getElementById('selectedCount');
const contentCount = document.querySelector('.content-count');
const pageTitle = document.querySelector('#listView .page-title');
const selectAllCheckbox = document.getElementById('selectAll');
const confirmModal = document.getElementById('confirmModal');
const toast = document.getElementById('toast');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    loadTags();
    bindEvents();
});

// 绑定事件
function bindEvents() {
    // 导航点击
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            const filter = item.dataset.filter;

            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            if (view === 'list') {
                showListView();
                currentFilter = filter;
                renderList();
                updatePageTitle();
            }
        });
    });

    // 新建按钮
    document.getElementById('btnNew').addEventListener('click', () => {
        showEditor(null);
    });

    // 返回按钮
    document.getElementById('btnBack').addEventListener('click', () => {
        showListView();
    });

    // 全选
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = listBody.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = e.target.checked;
            const item = cb.closest('.list-item');
            if (e.target.checked) {
                selectedItems.add(item.dataset.id);
                item.classList.add('selected');
            } else {
                selectedItems.delete(item.dataset.id);
                item.classList.remove('selected');
            }
        });
        updateBatchBar();
    });

    // 批量删除
    document.getElementById('btnBatchDelete').addEventListener('click', () => {
        showConfirmModal(
            '确认删除',
            `确定要删除选中的 ${selectedItems.size} 项内容吗？此操作不可撤销。`,
            async () => {
                await batchDelete();
            }
        );
    });

    // 批量设为草稿
    document.getElementById('btnBatchDraft').addEventListener('click', async () => {
        await batchUpdateDraft(true);
    });

    // 批量发布
    document.getElementById('btnBatchPublish').addEventListener('click', async () => {
        await batchUpdateDraft(false);
    });

    // 取消批量选择
    document.getElementById('btnCancelBatch').addEventListener('click', () => {
        clearSelection();
    });

    // 保存草稿
    document.getElementById('btnSaveDraft').addEventListener('click', () => {
        saveContent(true);
    });

    // 发布
    document.getElementById('btnPublish').addEventListener('click', () => {
        saveContent(false);
    });

    // 标签输入
    const tagInput = document.getElementById('inputTag');
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(tagInput.value.trim());
            tagInput.value = '';
        }
    });

    // 模态框按钮
    document.getElementById('btnModalCancel').addEventListener('click', hideConfirmModal);
}

// 加载内容
async function loadContent() {
    try {
        listBody.innerHTML = '<div class="loading">加载中...</div>';
        const response = await fetch(`${API_BASE}/content`);
        allContent = await response.json();
        renderList();
    } catch (error) {
        listBody.innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div><p>加载失败，请确保服务器正在运行</p></div>';
        console.error('Load error:', error);
    }
}

// 加载标签
async function loadTags() {
    try {
        const response = await fetch(`${API_BASE}/tags`);
        availableTags = await response.json();
        renderTagSuggestions();
    } catch (error) {
        console.error('Load tags error:', error);
    }
}

// 渲染列表
function renderList() {
    let filtered = allContent;

    if (currentFilter === 'drafts') {
        filtered = allContent.filter(item => item.draft === true);
    } else if (currentFilter !== 'all') {
        filtered = allContent.filter(item => item.collection === currentFilter);
    }

    contentCount.textContent = `${filtered.length} 篇`;

    if (filtered.length === 0) {
        listBody.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>暂无内容</p>
            </div>
        `;
        return;
    }

    listBody.innerHTML = filtered.map(item => `
        <div class="list-item ${selectedItems.has(item.id) ? 'selected' : ''}" data-id="${item.id}">
            <label class="checkbox-wrapper">
                <input type="checkbox" ${selectedItems.has(item.id) ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
            <span class="item-title" data-collection="${item.collection}" data-slug="${item.slug}">${item.title || '无标题'}</span>
            <span class="item-collection ${item.collection}">${getCollectionName(item.collection)}</span>
            <span class="item-status ${item.draft ? 'status-draft' : 'status-published'}">
                ${item.draft ? '草稿' : '已发布'}
            </span>
            <span class="item-date">${formatDate(item.date)}</span>
            <div class="item-actions">
                <button class="btn-icon" title="编辑" onclick="editItem('${item.collection}', '${item.slug}')">✏️</button>
                <button class="btn-icon danger" title="删除" onclick="deleteItem('${item.collection}', '${item.slug}', '${item.title}')">🗑️</button>
            </div>
        </div>
    `).join('');

    // 绑定复选框事件
    listBody.querySelectorAll('.list-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const item = e.target.closest('.list-item');
            const id = item.dataset.id;

            if (e.target.checked) {
                selectedItems.add(id);
                item.classList.add('selected');
            } else {
                selectedItems.delete(id);
                item.classList.remove('selected');
            }
            updateBatchBar();
        });
    });

    // 绑定标题点击
    listBody.querySelectorAll('.item-title').forEach(title => {
        title.addEventListener('click', () => {
            editItem(title.dataset.collection, title.dataset.slug);
        });
    });
}

// 更新批量操作栏
function updateBatchBar() {
    if (selectedItems.size > 0) {
        batchBar.classList.add('active');
        selectedCount.textContent = selectedItems.size;
    } else {
        batchBar.classList.remove('active');
    }
}

// 清除选择
function clearSelection() {
    selectedItems.clear();
    selectAllCheckbox.checked = false;
    listBody.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('selected');
        item.querySelector('input[type="checkbox"]').checked = false;
    });
    updateBatchBar();
}

// 批量删除
async function batchDelete() {
    const items = Array.from(selectedItems).map(id => {
        const [collection, filename] = id.split('/');
        return { collection, slug: filename.replace('.md', '') };
    });

    try {
        const response = await fetch(`${API_BASE}/content/batch-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });

        const result = await response.json();

        if (result.success) {
            showToast(`成功删除 ${result.deleted} 篇内容`, 'success');
            clearSelection();
            await loadContent();
        } else {
            showToast('删除失败: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('操作失败', 'error');
    }

    hideConfirmModal();
}

// 批量更新草稿状态
async function batchUpdateDraft(draft) {
    const items = Array.from(selectedItems).map(id => {
        const [collection, filename] = id.split('/');
        return { collection, slug: filename.replace('.md', '') };
    });

    try {
        const response = await fetch(`${API_BASE}/content/batch-draft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, draft })
        });

        const result = await response.json();

        if (result.success) {
            showToast(`已${draft ? '设为草稿' : '发布'} ${result.updated} 篇内容`, 'success');
            clearSelection();
            await loadContent();
        }
    } catch (error) {
        showToast('操作失败', 'error');
    }
}

// 编辑内容
async function editItem(collection, slug) {
    try {
        const response = await fetch(`${API_BASE}/content/${collection}/${slug}`);
        const item = await response.json();
        showEditor(item);
    } catch (error) {
        showToast('加载失败', 'error');
    }
}

// 删除单个内容
function deleteItem(collection, slug, title) {
    showConfirmModal(
        '确认删除',
        `确定要删除「${title}」吗？此操作不可撤销。`,
        async () => {
            try {
                const response = await fetch(`${API_BASE}/content/${collection}/${slug}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    showToast('删除成功', 'success');
                    await loadContent();
                }
            } catch (error) {
                showToast('删除失败', 'error');
            }
            hideConfirmModal();
        }
    );
}

// 显示编辑器
function showEditor(item) {
    currentEditItem = item;
    listView.classList.remove('active');
    editView.classList.add('active');

    const editTitle = document.getElementById('editTitle');

    if (item) {
        editTitle.textContent = '编辑内容';
        document.getElementById('inputTitle').value = item.title || '';
        document.getElementById('inputDesc').value = item.description || '';
        document.getElementById('inputBody').value = item.body || '';
        document.getElementById('inputCollection').value = item.collection || 'articles';
        document.getElementById('inputSubCategory').value = item.subCategory || '';
        document.getElementById('inputCover').value = item.cover || '';
        document.getElementById('inputPinned').checked = item.pinned || false;

        // 渲染已有标签
        renderSelectedTags(item.tags || []);
    } else {
        editTitle.textContent = '新建内容';
        document.getElementById('inputTitle').value = '';
        document.getElementById('inputDesc').value = '';
        document.getElementById('inputBody').value = '';
        document.getElementById('inputCollection').value = 'articles';
        document.getElementById('inputSubCategory').value = '';
        document.getElementById('inputCover').value = '';
        document.getElementById('inputPinned').checked = false;
        renderSelectedTags([]);
    }
}

// 显示列表
function showListView() {
    editView.classList.remove('active');
    listView.classList.add('active');
    currentEditItem = null;
}

// 保存内容
async function saveContent(asDraft) {
    const title = document.getElementById('inputTitle').value.trim();
    if (!title) {
        showToast('请输入标题', 'error');
        return;
    }

    const collection = document.getElementById('inputCollection').value;
    const slug = currentEditItem?.slug || generateSlug(title);

    // 获取选中的标签
    const tags = [];
    document.querySelectorAll('#tagsContainer .tag-item').forEach(tag => {
        tags.push(tag.dataset.tag);
    });

    const data = {
        title,
        description: document.getElementById('inputDesc').value.trim(),
        date: currentEditItem?.date || new Date().toISOString(),
        body: document.getElementById('inputBody').value,
        subCategory: document.getElementById('inputSubCategory').value.trim() || '其他',
        cover: document.getElementById('inputCover').value.trim(),
        pinned: document.getElementById('inputPinned').checked,
        tags,
        draft: asDraft
    };

    try {
        const response = await fetch(`${API_BASE}/content/${collection}/${slug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast(asDraft ? '已保存为草稿' : '发布成功', 'success');
            showListView();
            await loadContent();
        } else {
            const result = await response.json();
            showToast('保存失败: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('保存失败', 'error');
    }
}

// 生成 slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || 'untitled-' + Date.now();
}

// 标签相关
function renderSelectedTags(tags) {
    const container = document.getElementById('tagsContainer');
    const input = document.getElementById('inputTag');

    // 清除现有标签
    container.querySelectorAll('.tag-item').forEach(t => t.remove());

    // 添加标签
    tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.dataset.tag = tag;
        tagEl.innerHTML = `${tag} <span class="tag-remove" onclick="removeTag(this)">×</span>`;
        container.insertBefore(tagEl, input);
    });
}

function addTag(tag) {
    if (!tag) return;

    const container = document.getElementById('tagsContainer');
    const input = document.getElementById('inputTag');

    // 检查是否已存在
    if (container.querySelector(`[data-tag="${tag}"]`)) return;

    const tagEl = document.createElement('span');
    tagEl.className = 'tag-item';
    tagEl.dataset.tag = tag;
    tagEl.innerHTML = `${tag} <span class="tag-remove" onclick="removeTag(this)">×</span>`;
    container.insertBefore(tagEl, input);
}

function removeTag(el) {
    el.parentElement.remove();
}

function renderTagSuggestions() {
    const container = document.getElementById('tagSuggestions');
    container.innerHTML = availableTags.slice(0, 15).map(tag =>
        `<span class="tag-suggestion" onclick="addTag('${tag}')">${tag}</span>`
    ).join('');
}

// 辅助函数
function getCollectionName(collection) {
    const names = {
        articles: '深度长文',
        projects: '项目拆解',
        stories: '学员故事'
    };
    return names[collection] || collection;
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function updatePageTitle() {
    const titles = {
        all: '全部内容',
        articles: '深度长文',
        projects: '项目拆解',
        stories: '学员故事',
        drafts: '草稿箱'
    };
    pageTitle.textContent = titles[currentFilter] || '全部内容';
}

// 模态框
let modalCallback = null;

function showConfirmModal(title, message, callback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modalCallback = callback;
    confirmModal.classList.add('active');

    document.getElementById('btnModalConfirm').onclick = () => {
        if (modalCallback) modalCallback();
    };
}

function hideConfirmModal() {
    confirmModal.classList.remove('active');
    modalCallback = null;
}

// Toast
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast active ${type}`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// 全局函数（供 onclick 使用）
window.editItem = editItem;
window.deleteItem = deleteItem;
window.addTag = addTag;
window.removeTag = removeTag;
