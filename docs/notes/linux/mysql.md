---
title: MySQL 部署与使用
description: MySQL 容器部署、连接、备份、改密码
---

# 06 MySQL 部署与使用

> 本机已部署：MySQL **8.4.13**，容器名 `mysql`，配置文件 `D:\linux\mysql\docker-compose.yml`。

## 连接信息（Windows 客户端直连）

Navicat / DBeaver / IDEA 等工具直接填：

| 参数 | 值 |
|---|---|
| 主机 | `localhost` 或 `127.0.0.1` |
| 端口 | `3306` |
| 用户 | `root` |
| 密码 | `123456` |

WSL2 会把容器端口自动转发到 Windows 的 localhost，无需额外配置。

## 进入 MySQL 命令行

```bash
# 方法一：先进 Ubuntu，再进 MySQL
wsl -d Ubuntu
docker exec -it mysql mysql -uroot -p     # 提示输密码：123456

# 方法二：Windows 一条命令直达
wsl -d Ubuntu -- docker exec -it mysql mysql -uroot -p
```

进入后看到 `mysql>` 提示符即可写 SQL（语句以分号 `;` 结尾）：

```sql
SHOW DATABASES;
USE 库名;
SELECT VERSION();
exit          -- 退出 MySQL 客户端
```

## 部署与启动命令

```bash
cd /mnt/d/linux/mysql      # WSL 里进入 compose 目录
docker compose up -d       # 部署/启动
docker compose ps          # 状态
docker compose logs -f     # 日志
docker compose down        # 删除容器（数据保留）
docker compose down -v     # ⚠ 连数据一起删
```

首次启动会初始化数据目录，需要等 30~60 秒才能接受连接，
可用 `docker logs -f mysql` 看到 `ready for connections` 即就绪。

## 数据持久化与自启

- 数据存在命名卷 `mysql-data`（位于 WSL 虚拟磁盘 `D:\linux\Ubuntu-24.04\ext4.vhdx` 内）
- 重启容器、重启 WSL（`wsl --shutdown`）数据都不丢
- compose 里设了 `restart: unless-stopped`，WSL 启动后 MySQL 自动运行

## 备份与恢复

```bash
# 备份所有数据库（在 WSL 里执行，输出到当前目录）
docker exec mysql mysqldump -uroot -p123456 --all-databases > backup.sql

# 恢复
docker exec -i mysql mysql -uroot -p123456 < backup.sql
```

## 修改 root 密码（重要）

compose 里的 `MYSQL_ROOT_PASSWORD` **只在数据目录首次初始化时生效**。
已有数据后改密码要进 MySQL 执行 SQL：

```sql
ALTER USER 'root'@'%' IDENTIFIED BY '新密码';
FLUSH PRIVILEGES;
```

改完同步更新 docker-compose.yml 保持一致（不影响已运行的容器，只作记录）。
