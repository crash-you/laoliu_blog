# 老刘的生财之道 - 功能配置手册

> 最后更新：2025年12月23日

本文档详细说明如何配置网站的三个核心功能：**搜索**、**评论**、**统计**。

---

## 目录

1. [搜索功能配置（Pagefind）](#一搜索功能配置pagefind)
2. [评论系统配置（Twikoo）](#二评论系统配置twikoo)
3. [百度统计配置](#三百度统计配置)

---

## 一、搜索功能配置（Pagefind）

### 为什么开发模式下搜索不可用？

![搜索提示](C:/Users/86180/.gemini/antigravity/brain/bf0911d1-9b89-4b66-bef8-a738a6f92504/uploaded_image_0_1766482038581.png)

**这是正常的！** Pagefind 需要在构建后才能工作，因为它需要：

1. 先构建所有 HTML 页面
2. 然后扫描并索引所有内容
3. 生成搜索索引文件

### 配置步骤

#### 步骤1：构建网站

```bash
cd f:\xm\AI\outsea\now\laoliu-blog
npm run build
```

你会看到类似输出：

```
Running Pagefind v1.4.0
Indexed 10 pages
Indexed 629 words
Finished in 0.177 seconds
```

#### 步骤2：预览搜索功能

```bash
npm run preview
```

访问 <http://localhost:4321/search，现在搜索应该可以正常工作了。>

#### 步骤3：部署后自动生效

当你部署到 Cloudflare Pages 后，每次自动构建都会生成搜索索引，搜索功能自动可用。

### 注意事项

- ✅ 开发模式 (`npm run dev`) 下搜索**不可用**，这是正常的
- ✅ 构建后 (`npm run build`) 搜索才可用
- ✅ 部署到 Cloudflare Pages 后自动可用

---

## 二、评论系统配置（Twikoo）

### 当前状态

![评论待配置](C:/Users/86180/.gemini/antigravity/brain/bf0911d1-9b89-4b66-bef8-a738a6f92504/uploaded_image_1_1766482038581.png)

评论区显示"待配置"是因为还没有设置 Twikoo 后端。

### 方案选择

Twikoo 需要一个后端服务来存储评论，有以下几种方式：

| 方式 | 难度 | 费用 | 推荐度 |
|------|------|------|--------|
| **Vercel + MongoDB Atlas** | ⭐ 简单 | 免费 | ⭐⭐⭐ 强烈推荐 |
| Zeabur | ⭐ 简单 | 有免费额度 | ⭐⭐ |
| 腾讯云 CloudBase | ⭐⭐ 中等 | 基础版免费 | ⭐⭐ |

**推荐选择 Vercel + MongoDB Atlas**，完全免费且配置简单。

---

### 方案一：Vercel 部署（推荐）

#### 第1步：注册 MongoDB Atlas 账号

1. 打开 <https://www.mongodb.com/cloud/atlas/register>
2. 点击 **Try Free** 注册账号（可用 Google 账号直接登录）
3. 创建完成后，点击 **Build a Database**
4. 选择 **M0 免费版**（0成本）
5. Provider 选择 **AWS**，Region 选择 **Hong Kong** 或 **Singapore**
6. 点击 **Create**

#### 第2步：配置数据库访问

1. 在左侧菜单点击 **Database Access**
2. 点击 **Add New Database User**
3. 设置用户名和密码（**记住这个密码！**）
4. 权限选择 **Read and write to any database**
5. 点击 **Add User**

#### 第3步：配置网络访问

1. 在左侧菜单点击 **Network Access**
2. 点击 **Add IP Address**
3. 点击 **Allow Access from Anywhere**（重要！）
4. 点击 **Confirm**

#### 第4步：获取连接字符串

1. 回到 **Database** 页面
2. 点击 **Connect**
3. 选择 **Drivers**
4. 复制连接字符串，格式类似：

```
mongodb+srv://用户名:密码@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. **把 `<password>` 替换成你刚才设置的密码**

#### 第5步：部署 Twikoo 到 Vercel

1. 打开 <https://vercel.com/signup> 注册/登录（可用 GitHub 直接登录）
2. 点击下面的一键部署按钮：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftwikoojs%2Ftwikoo%2Ftree%2Fmain%2Fsrc%2Fserver%2Fvercel-min)

1. 点击 **Create**

#### 第6步：配置环境变量

1. 部署完成后，进入项目的 **Settings**
2. 点击左侧 **Environment Variables**
3. 添加变量：
   - **Name**: `MONGODB_URI`
   - **Value**: 你的 MongoDB 连接字符串（第4步获取的）
4. 点击 **Save**

#### 第7步：关闭访问保护

1. 进入 **Settings** → **Deployment Protection**
2. 将 **Vercel Authentication** 设置为 **Disabled**
3. 点击 **Save**

#### 第8步：重新部署

1. 进入 **Deployments** 标签
2. 点击最新一条部署记录右侧的 **⋯** 菜单
3. 点击 **Redeploy** → **Redeploy**
4. 等待部署完成

#### 第9步：获取你的环境ID

部署完成后，进入 **Settings** → **Domains**，你会看到一个域名，例如：

```
twikoo-abc123.vercel.app
```

你的 **环境 ID** 就是 `https://twikoo-abc123.vercel.app`（注意包含 https://）

#### 第10步：配置到网站

编辑 `src/components/Comments.astro` 文件，找到这一行：

```javascript
const TWIKOO_ENV_ID = 'YOUR_TWIKOO_ENV_ID';
```

替换为：

```javascript
const TWIKOO_ENV_ID = 'https://twikoo-abc123.vercel.app';  // 替换为你的域名
```

#### 第11步：验证

1. 重新构建：`npm run build`
2. 预览：`npm run preview`
3. 打开任意文章页面，评论区应该正常显示了

---

### 方案二：Zeabur 部署

如果 Vercel 访问较慢，可以用 Zeabur：

1. 注册 <https://dash.zeabur.com>
2. 点击 **部署新服务** → **部署其他服务** → **部署 MongoDB**
3. 打开 <https://github.com/twikoojs/twikoo-zeabur> 并 Fork
4. 回到 Zeabur 点击 **部署新服务** → **部署你的源代码** → 选择刚 Fork 的仓库
5. 部署完成后，进入 **设置** → **域名**，绑定域名如 `mytwikoo.zeabur.app`
6. 你的环境 ID 是 `https://mytwikoo.zeabur.app`

---

## 三、百度统计配置

### 第1步：注册百度统计

1. 打开 <https://tongji.baidu.com/>
2. 点击 **立即免费注册** 或用百度账号登录
3. 完成注册

### 第2步：添加网站

1. 登录后，点击 **管理** → **新增网站**
2. 填写信息：
   - **网站域名**: 你的网站域名，如 `www.laoliu.com`
   - **网站首页**: `https://www.laoliu.com`
   - **网站名称**: `老刘的生财之道`
   - **行业类别**: 选择合适的分类
3. 点击 **确定**

### 第3步：获取统计代码

添加完成后，系统会显示统计代码，类似：

```html
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?abc123def456xyz789";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

你需要的是 `hm.js?` 后面的那串字符，例如：`abc123def456xyz789`

### 第4步：配置到网站

编辑 `src/components/Analytics.astro` 文件，找到这一行：

```javascript
const BAIDU_ANALYTICS_ID = 'YOUR_BAIDU_ANALYTICS_ID';
```

替换为：

```javascript
const BAIDU_ANALYTICS_ID = 'abc123def456xyz789';  // 替换为你的统计ID
```

### 第5步：验证

1. 部署网站到线上
2. 在百度统计后台点击 **代码检查**
3. 输入你的网址，验证代码是否安装成功

### 注意事项

- 百度统计需要网站能被外网访问才能生效
- 本地开发环境 (`localhost`) 无法统计
- 代码安装后，约20分钟后开始统计数据

---

## 快速检查清单

### 搜索功能

- [ ] 运行过 `npm run build`
- [ ] 构建输出显示 "Indexed X pages"

### 评论系统

- [ ] MongoDB Atlas 账号已创建
- [ ] 数据库用户密码已设置
- [ ] 网络访问已设置为"允许所有"
- [ ] Vercel 项目已部署
- [ ] MONGODB_URI 环境变量已配置
- [ ] 已关闭 Vercel Authentication
- [ ] 已重新部署
- [ ] `Comments.astro` 中的 ENV_ID 已替换

### 百度统计

- [ ] 百度统计账号已注册
- [ ] 网站已添加到百度统计
- [ ] 已获取统计ID
- [ ] `Analytics.astro` 中的 ID 已替换

---

## 常见问题

### Q: Vercel 域名访问很慢怎么办？

绑定自己的域名可以提升速度。在 Vercel 项目 Settings → Domains 中添加你的域名。

### Q: MongoDB Atlas 提示连接失败？

检查：

1. 密码是否正确（没有特殊字符问题）
2. Network Access 是否设置为 `0.0.0.0/0`
3. 连接字符串中的 `<password>` 是否已替换

### Q: 评论提交后不显示？

可能是浏览器缓存问题，尝试清除缓存或换个浏览器。

---

如有问题，可以参考官方文档：

- Twikoo: <https://twikoo.js.org/>
- Pagefind: <https://pagefind.app/>
- 百度统计: <https://tongji.baidu.com/>
