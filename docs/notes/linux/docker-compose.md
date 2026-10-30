---
title: Docker Compose
description: 用一个 YAML 文件声明服务，一条命令管理整个服务栈
---

# 05 Docker Compose

> 用一个 YAML 文件声明服务，一条命令管理整个服务栈。
> 本机现有示例：`D:\linux\mysql\docker-compose.yml`（WSL 内路径 `/mnt/d/linux/mysql/`）。

## 基本结构（以 MySQL 为例）

```yaml
services:
  mysql:
    image: mysql:8.4          # 镜像及版本
    container_name: mysql     # 容器名
    restart: unless-stopped   # WSL 启动后自动拉起（手动 stop 的除外）
    ports:
      - "3306:3306"           # 宿主机端口:容器端口
    environment:
      MYSQL_ROOT_PASSWORD: "123456"
      TZ: Asia/Shanghai
    volumes:
      - mysql-data:/var/lib/mysql   # 命名卷，数据持久化

volumes:
  mysql-data:                 # 声明命名卷（数据存在 WSL 虚拟磁盘里）
```

## 命令（在 compose 文件所在目录执行）

```bash
docker compose up -d        # 创建并后台启动（首次会自动拉镜像）
docker compose ps           # 查看服务状态
docker compose logs -f      # 实时跟踪日志（Ctrl+C 退出）
docker compose stop         # 停止（容器和数据保留）
docker compose start        # 再次启动
docker compose restart      # 重启
docker compose down         # 删除容器和网络（数据卷保留）
docker compose down -v      # ⚠ 彻底删除，连数据卷一起清掉
```

## 修改配置后的生效方式

改完 `docker-compose.yml`（改端口、环境变量、镜像版本等）执行：

```bash
docker compose up -d        # 会自动重建有变化的容器
```

注意：环境变量类配置（如 `MYSQL_ROOT_PASSWORD`）只在**数据目录首次初始化**时生效，
已有数据后改它不会改变现有密码，见 [MySQL 部署与使用](./mysql)。
