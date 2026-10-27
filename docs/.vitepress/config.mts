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
        text: 'Git',
        collapsed: true,
        items: [
          { text: 'Git 常用命令', link: '/notes/git/git-commands' }
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
