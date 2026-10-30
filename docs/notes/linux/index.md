---
title: Linux 环境总览
description: 本机 WSL、Docker、MySQL 环境速查与笔记目录
---

# Linux / Docker 知识库

> 本机环境速查（2026-10-29 搭建）：

| 项目 | 值 |
|---|---|
| WSL 版本 | 3.0.3.0（WSL2，systemd 已启用） |
| 发行版 | Ubuntu 24.04 LTS，名称 `Ubuntu`，默认用户 `peter` |
| 虚拟磁盘位置 | `D:\linux\Ubuntu-24.04\ext4.vhdx` |
| Docker | Engine 29.9.2 + Compose v5.6.1，装在 WSL Ubuntu 内部 |
| MySQL | 8.4.13 容器，端口 `localhost:3306`，root / 123456 |
| 镜像加速器 | `docker.m.daocloud.io`、`docker.1ms.run` |

## 目录

- [WSL 系统管理](./wsl) — WSL 安装、启动、发行版管理、跨系统执行命令
- [用户与密码](./linux-users) — 改 root 密码、用户切换、用户组
- [Docker 安装与镜像加速](./docker-install) — 官方源安装、daemon.json 加速器、服务管理
- [Docker 日常命令](./docker-commands) — 容器/镜像的运行、查看、进入、清理
- [Docker Compose](./docker-compose) — 用 compose 管理服务的全套命令
- [MySQL 部署与使用](./mysql) — MySQL 容器部署、连接、备份、改密码
