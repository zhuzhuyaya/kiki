import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: '栀总',
  description: '记录、整理、学习',
  // 部署在 zhuzhuyaya.github.io/kiki/，必须带这个前缀，资源才能正常加载
  base: '/kiki/',
  // TEMPLATE.md 只是复制用的笔记底稿，不发布到网站上
  srcExclude: ['**/TEMPLATE.md'],
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/kiki/favicon.svg' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '前端', link: '/markdown-examples' },
      { text: '后端', link: '/api-examples' }
    ],

    sidebar: [
      {
        text: '前端',
        collapsed: true,   // 默认收起，点击才展开
        items: [
          { text: 'Markdown 示例', link: '/markdown-examples' }
        ]
      },
      {
        text: '后端',
        collapsed: true,
        items: [
          { text: 'API 示例', link: '/api-examples' }
        ]
      },
      {
        text: 'Linux',
        collapsed: true,
        items: [
          { text: '环境总览', link: '/notes/linux/' },
          { text: 'WSL 系统管理', link: '/notes/linux/wsl' },
          { text: '用户与密码', link: '/notes/linux/linux-users' },
          { text: 'Docker 安装与镜像加速', link: '/notes/linux/docker-install' },
          { text: 'Docker 日常命令', link: '/notes/linux/docker-commands' },
          { text: 'Docker Compose', link: '/notes/linux/docker-compose' },
          { text: 'MySQL 部署与使用', link: '/notes/linux/mysql' }
        ]
      },
      {
        text: 'Git',
        collapsed: true,
        items: [
          { text: 'Git 常用命令', link: '/notes/git/git-commands' }
        ]
      },
      {
        text: '拾遗',
        collapsed: true,
        items: [
          { text: '前言', link: '/notes/leave_behind/sy_1' },
          { text: '数据库设计', link: '/notes/leave_behind/sy_2' },
          { text: '统一响应', link: '/notes/leave_behind/sy_3' },
          { text: '业务异常', link: '/notes/leave_behind/sy_4' },
          { text: '全局异常处理器', link: '/notes/leave_behind/sy_5' },
          { text: 'Docker 部署中间件', link: '/notes/leave_behind/sy_6' },
          { text: 'MyBatis-Plus 接入', link: '/notes/leave_behind/sy_7' },
          { text: '注册登录与鉴权', link: '/notes/leave_behind/sy_8' },
          { text: '工程骨架与包结构', link: '/notes/leave_behind/sy_11' },
          { text: '事务与传承人入驻', link: '/notes/leave_behind/sy_12' },
          { text: '属主校验与越权防护', link: '/notes/leave_behind/sy_13' },
          { text: 'MinIO 对象存储', link: '/notes/leave_behind/sy_14' }
        ]
      },
      {
        text: '拾遗·排错',
        collapsed: true,
        items: [
          { text: 'Boot4 降级复盘', link: '/notes/leave_behind/sy_9' },
          { text: '常见报错速查', link: '/notes/leave_behind/sy_10' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zhuzhuyaya' }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文章', buttonAriaLabel: '搜索文章' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            displayDetails: '显示详细列表',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },

    footer: {
      message: '记录、整理、学习',
      copyright: '© 2026 栀总'
    }
  }
})
