// 网站全局配置
// 在此文件中集中管理网站的基本信息

export const SITE_TITLE = '老刘的生财之道';
export const SITE_DESCRIPTION = '深度长文 | 项目拆解 | 互联网赚钱方法论 - 沉淀知识，分享经验，助你找到属于自己的生财之道';

// 导航配置
export const NAV_LINKS = [
  { href: '/', text: '首页' },
  { href: '/articles', text: '深度长文' },
  { href: '/projects', text: '项目拆解' },
  { href: '/stories', text: '学员故事' },
  { href: '/about', text: '关于老刘' },
];

// 内容分类配置
export const ARTICLE_CATEGORIES = [
  { slug: 'mindset', name: '互联网思维', description: '底层逻辑与认知升级' },
  { slug: 'monetization', name: '变现方法论', description: '把知识和技能变成钱' },
  { slug: 'growth', name: '个人成长', description: '持续进化的方法' },
  { slug: 'observation', name: '行业观察', description: '看透行业趋势和机会' },
];

export const PROJECT_CATEGORIES = [
  { slug: 'side-hustle', name: '副业项目', description: '适合工作之余操作' },
  { slug: 'ecommerce', name: '电商实战', description: '电商相关项目拆解' },
  { slug: 'traffic', name: '流量获取', description: '获取精准流量的方法' },
  { slug: 'tools', name: '工具推荐', description: '提效工具和资源' },
];

// 学员故事分类
export const STORY_CATEGORIES = [
  { slug: 'success', name: '成功案例', description: '学员的成功变现经历' },
  { slug: 'journey', name: '成长历程', description: '从0到1的真实记录' },
  { slug: 'insight', name: '踩坑经验', description: '那些交过的学费' },
];

// 难度等级
export const DIFFICULTY_LEVELS = [
  { slug: 'beginner', name: '入门', color: '#48bb78' },
  { slug: 'intermediate', name: '进阶', color: '#ed8936' },
  { slug: 'advanced', name: '高级', color: '#e53e3e' },
];

// 社交链接配置
export const SOCIAL_LINKS = {
  wechat: '老刘说钱', // 公众号名称
  // 可以添加更多社交平台
};
