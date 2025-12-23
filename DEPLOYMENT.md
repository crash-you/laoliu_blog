# 老刘的生财之道 - 部署与运营指南

## 一、项目信息

```
项目位置: f:\xm\AI\outsea\now\laoliu-blog
框架: Astro 5.x
输出: 静态站点
```

---

## 二、本地开发命令

```bash
# 进入项目目录
cd f:\xm\AI\outsea\now\laoliu-blog

# 启动开发服务器
npm run dev
# 访问 http://localhost:4321

# 构建生产版本（含搜索索引）
npm run build

# 预览生产版本
npm run preview
```

---

## 三、Cloudflare Pages 部署

### 步骤1：推送代码到 GitHub

```bash
# 初始化 Git（如果还没有）
cd f:\xm\AI\outsea\now\laoliu-blog
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库后
git remote add origin https://github.com/你的用户名/laoliu-blog.git
git push -u origin main
```

### 步骤2：连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 授权并选择你的 GitHub 仓库

### 步骤3：配置构建参数

| 设置项 | 值 |
|--------|-----|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

### 步骤4：环境变量（可选）

如需设置环境变量，在 **Settings** → **Environment variables** 中添加。

### 步骤5：部署

点击 **Save and Deploy**，等待部署完成。

部署成功后会获得一个 `.pages.dev` 域名，如：

```
https://laoliu-blog.pages.dev
```

---

## 四、域名配置

### 购买域名

推荐在以下平台购买（国内备案需要）：

- [腾讯云域名](https://dnspod.cloud.tencent.com/)
- [阿里云万网](https://wanwang.aliyun.com/)

推荐域名格式：

- `laoliu.com`
- `laoliu.cn`
- `shengcai.com`

### 绑定到 Cloudflare Pages

1. 在 Cloudflare Pages 项目中，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名，如 `www.laoliu.com`
4. 按提示配置 DNS 记录

---

## 五、ICP 备案

**重要**：使用国内 CDN 必须完成备案！

### 备案准备

1. 域名必须在国内注册商购买
2. 需要一台国内服务器（最便宜的轻量云即可）
3. 准备材料：身份证、域名证书

### 备案流程

1. 登录腾讯云/阿里云控制台
2. 进入 **备案** 模块
3. 填写备案信息
4. 上传材料
5. 等待审核（7-20 个工作日）

### 备案成功后

在网站底部添加备案号，已在 `Footer.astro` 中预留位置：

```javascript
// src/components/Footer.astro
// 找到这行，替换为你的备案号
粤ICP备XXXXXXXX号
```

---

## 六、腾讯云 CDN 配置

备案成功后：

### 步骤1：添加域名

1. 登录 [腾讯云 CDN](https://console.cloud.tencent.com/cdn)
2. 点击 **添加域名**
3. 填写加速域名（如 `www.laoliu.com`）

### 步骤2：配置源站

| 设置项 | 值 |
|--------|-----|
| 源站类型 | 自有源 |
| 源站地址 | `laoliu-blog.pages.dev` |
| 回源协议 | HTTPS |

### 步骤3：配置 CNAME

将你的域名 CNAME 解析到腾讯云提供的 CDN 地址。

---

## 七、功能配置

### 配置评论系统 (Twikoo)

1. 在腾讯云创建云函数
2. 部署 Twikoo 到云函数
3. 编辑 `src/components/Comments.astro`
4. 将 `YOUR_TWIKOO_ENV_ID` 替换为你的环境ID

详细教程：[Twikoo 官方文档](https://twikoo.js.org/)

### 配置百度统计

1. 注册 [百度统计](https://tongji.baidu.com/)
2. 添加网站，获取统计ID
3. 编辑 `src/components/Analytics.astro`
4. 将 `YOUR_BAIDU_ANALYTICS_ID` 替换为你的ID

---

## 八、发布文章教程

### 文章目录

| 类型 | 目录 |
|------|------|
| 深度长文 | `src/content/articles/` |
| 项目拆解 | `src/content/projects/` |
| 学员故事 | `src/content/stories/` |

### 文章格式

新建 `.md` 文件，格式如下：

**深度长文**：

```markdown
---
title: '文章标题'
description: '简要描述'
pubDate: 2024-12-23
category: 'mindset'  # mindset/monetization/growth/observation
tags: ['标签1', '标签2']
featured: false
draft: false
---

正文内容...
```

**项目拆解**：

```markdown
---
title: '项目名称'
description: '项目描述'
pubDate: 2024-12-23
category: 'side-hustle'  # side-hustle/ecommerce/traffic/tools
tags: ['标签']
difficulty: 'beginner'  # beginner/intermediate/advanced
estimatedIncome: '3000-5000元/月'
featured: false
draft: false
---

正文内容...
```

**学员故事**：

```markdown
---
title: '故事标题'
description: '简要描述'
pubDate: 2024-12-23
category: 'success'  # success/journey/insight
author: '学员昵称'
income: '月入5000+'
duration: '3个月'
tags: ['标签']
featured: false
draft: false
---

正文内容...
```

### 发布流程

1. 在对应目录创建 `.md` 文件
2. 填写 frontmatter 和内容
3. 本地预览：`npm run dev`
4. 确认无误后提交：

```bash
git add .
git commit -m "发布新文章：文章标题"
git push
```

5. Cloudflare Pages 会自动部署

---

## 九、常见问题

### 搜索不工作？

运行 `npm run build` 后 Pagefind 才会生成索引。

### 评论显示"待配置"？

需要配置 Twikoo 环境ID，见上方说明。

### 图片怎么添加？

将图片放到 `public/images/` 目录，在文章中引用：

```markdown
![图片描述](/images/your-image.jpg)
```

### 怎么隐藏文章？

设置 `draft: true`，文章不会在列表显示。
