---
title: Git 常用命令
description: 日常更新笔记站点用得到的 Git 命令速查
---

# Git 常命令

> 日常更新这个笔记站用得上的 Git 命令速查，忘了就回来翻。

## 查看状态

| 命令 | 作用 |
| --- | --- |
| git status | 查看哪些文件改了、哪些还没提交 |
| git log --oneline | 查看提交历史，一行一条 |
| git diff | 查看还没提交的改动内容 |

## 提交三步

```bash
git add .              # 收集所有改动
git commit -m "写清楚这次改了什么"   # 存一个版本
git push               # 推到 GitHub，约 1 分钟后网站自动更新
```

## 撤销操作

::: warning 注意
撤销类命令会丢掉未提交的改动，用之前先想一下要不要。
:::

| 命令 | 作用 |
| --- | --- |
| git restore 文件名 | 丢弃某个文件还没提交的改动 |
| git commit --amend | 补充修改上一次的提交说明 |
