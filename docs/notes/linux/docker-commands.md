---
title: Docker 日常命令
description: 容器/镜像的运行、查看、进入、清理
---

# 04 Docker 日常命令

> 在 WSL Ubuntu 里执行（`wsl -d Ubuntu` 进入后），或从 Windows 用
> `wsl -d Ubuntu -- docker <命令>` 直接调用。

## 容器生命周期

```bash
docker run -it ubuntu bash      # 创建并进入一个容器（-it 交互式终端）
docker run --rm hello-world     # --rm：退出后自动删除容器（适合测试）
docker exec -it <容器ID或名> bash  # 从外部新开一个 shell 进入"正在运行"的容器
exit / Ctrl+D                   # 退出容器 shell；用 -it 启动的容器会随之停止
docker stop <容器>              # 停止容器
docker start <容器>             # 启动已存在的容器
docker rm <容器>                # 删除容器（运行中的要先 stop）
```

## 查看状态

```bash
docker ps                       # 正在运行的容器
docker ps -a                    # 全部容器（含已停止）
docker logs <容器>              # 查看容器日志
docker logs --tail 30 <容器>    # 只看最后 30 行
docker images                   # 本地已有的镜像
docker info                     # 引擎信息（含生效的镜像加速器配置）
```

## 镜像管理

```bash
docker pull <镜像>              # 拉取镜像（走 daemon.json 里配置的加速器）
docker rmi <镜像>               # 删除镜像
```

## 常见误区

- **容器里没有 docker 命令**：`docker run -it ubuntu bash` 之后你就进入了容器内部
  （主机名变成 12 位随机十六进制如 `3e45898f99fe`），容器是隔离的迷你系统，
  docker CLI 在外层宿主机（Ubuntu）上。要先 `exit` 出来才能操作 docker。
- **看提示符辨位置**：`peter@DESKTOP-O1V1OVU` = WSL Ubuntu；`root@3e45898f99fe` = 容器内部。
