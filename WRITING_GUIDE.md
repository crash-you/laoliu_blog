# 老刘的生财之道 - 写作指南

## 一、在哪写文章？

| 内容类型 | 目录位置 | 说明 |
|---------|---------|-----|
| 深度长文 | `src/content/articles/` | 方法论、思维、个人成长 |
| 项目拆解 | `src/content/projects/` | 具体项目分析、操作流程 |
| 学员故事 | `src/content/stories/` | 成功案例、经验分享 |

---

## 二、文章格式

### 深度长文模板

在 `src/content/articles/` 目录下创建 `.md` 文件：

```markdown
---
title: '文章标题'
description: '一句话描述，会显示在列表页'
pubDate: 2025-12-23
category: 'mindset'
tags: ['关键词1', '关键词2', '关键词3']
featured: false
draft: false
---

正文内容写在这里...

## 二级标题

段落内容...

### 三级标题

- 列表项1
- 列表项2

> 引用文字

**加粗** 和 *斜体*
```

### 文章分类（category）选项

| 分类值 | 显示名称 | 适合内容 |
|--------|---------|---------|
| `mindset` | 互联网思维 | 底层逻辑、认知升级 |
| `monetization` | 变现方法论 | 赚钱方法、盈利模式 |
| `growth` | 个人成长 | 自我提升、习惯培养 |
| `observation` | 行业观察 | 趋势分析、行业动态 |

---

### 项目拆解模板

在 `src/content/projects/` 目录下创建 `.md` 文件：

```markdown
---
title: '项目名称'
description: '项目简介'
pubDate: 2025-12-23
category: 'side-hustle'
tags: ['闲鱼', '副业', '无货源']
difficulty: 'beginner'
estimatedIncome: '3000-8000元/月'
featured: false
draft: false
---

## 项目简介

这个项目是什么...

## 优势分析

- 优点1
- 优点2

## 操作流程

### 第一步：XXX

具体操作...

### 第二步：XXX

具体操作...

## 注意事项

需要避开的坑...

## 总结

适合什么人做...
```

### 项目分类（category）选项

| 分类值 | 显示名称 | 适合内容 |
|--------|---------|---------|
| `side-hustle` | 副业项目 | 工作之余可做 |
| `ecommerce` | 电商实战 | 电商相关项目 |
| `traffic` | 流量获取 | 引流方法 |
| `tools` | 工具推荐 | 效率工具 |

### 难度等级（difficulty）选项

| 值 | 显示 | 说明 |
|----|------|------|
| `beginner` | 入门 | 新手可做 |
| `intermediate` | 进阶 | 需要一定基础 |
| `advanced` | 高级 | 需要丰富经验 |

---

### 学员故事模板

在 `src/content/stories/` 目录下创建 `.md` 文件：

```markdown
---
title: '故事标题'
description: '简短描述'
pubDate: 2025-12-23
category: 'success'
author: '学员昵称（可匿名）'
income: '月入5000+'
duration: '3个月'
tags: ['闲鱼', '宝妈']
featured: false
draft: false
---

## 背景

学员是什么情况...

## 学习过程

怎么开始的...

## 成果

现在怎么样了...

## 经验分享

给其他人的建议...
```

### 故事分类（category）选项

| 分类值 | 显示名称 | 说明 |
|--------|---------|------|
| `success` | 成功案例 | 已经变现成功 |
| `journey` | 成长历程 | 从0到1的过程 |
| `insight` | 踩坑经验 | 失败教训 |

---

## 三、如何设置"精选推荐"？

在文章的 frontmatter 中设置 `featured: true` 即可：

```markdown
---
title: '这篇文章会显示在精选推荐'
...
featured: true  ← 设为 true
draft: false
---
```

首页会自动显示最多4个精选内容。

---

## 四、如何隐藏文章（草稿）？

设置 `draft: true`，文章不会显示在任何列表中：

```markdown
---
title: '这是一篇草稿'
...
draft: true  ← 不会显示
---
```

写完后改成 `draft: false` 即可发布。

---

## 五、标签（tags）怎么写？

标签是一个数组，可以写多个：

```markdown
tags: ['副业', '闲鱼', '无货源', '新手入门']
```

- 标签会显示在文章卡片和侧边栏
- 建议每篇文章 2-5 个标签
- 尽量复用已有标签，保持一致性

常用标签建议：

- 项目类：`副业`、`电商`、`闲鱼`、`抖音`、`小红书`
- 难度类：`新手入门`、`进阶`、`高阶`
- 方法类：`引流`、`变现`、`选品`、`运营`

---

## 六、首页会自动更新吗？

**是的！完全自动。**

- **最新文章**：自动显示最新的3篇深度长文
- **最新项目**：自动显示最新的3个项目拆解
- **精选推荐**：自动显示 `featured: true` 的内容
- **统计数据**：自动统计文章和项目数量

你只需要写文章，首页会自己更新。

---

## 七、发布流程

### 本地写作

1. 在对应目录创建 `.md` 文件
2. 复制模板，填写内容
3. 本地预览：`npm run dev`
4. 访问 <http://localhost:4321> 检查效果

### 发布上线

```bash
git add .
git commit -m "发布新文章：文章标题"
git push
```

Cloudflare Pages 会自动部署（约1-2分钟）。

---

## 八、常见问题

### Q: 文件名怎么取？

英文小写，用短横线分隔，如：`how-to-make-money.md`

### Q: 图片怎么添加？

1. 图片放到 `public/images/` 目录
2. 在文章中引用：`![描述](/images/my-image.jpg)`

### Q: 中文文件名可以吗？

可以，但建议用英文，避免编码问题。

### Q: 怎么添加代码块？

使用三个反引号：

```javascript
console.log('Hello World');
```

### Q: 日期格式是什么？

`YYYY-MM-DD` 格式，如 `2025-12-23`
