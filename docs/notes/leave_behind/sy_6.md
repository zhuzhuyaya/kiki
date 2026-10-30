---
title: 拾遗项目
description: Docker Compose 部署中间件

---

# Docker Compose 部署中间件

> 一键拉起项目全部中间件（MySQL / Redis / RabbitMQ / ES / MinIO），以及"逐个拉取镜像"的正确姿势。

## 逐个拉取，而不是一把梭

`docker compose up` 只会拉取**本地没有的**镜像。所以推荐先手动逐个 pull，好处：

- 某个失败只重试那一个，不互相拖累
- 拉下来的就落袋为安，compose 不会再动
- `docker compose up -d mysql` 还可以只启动某一个服务

```bash
docker pull mysql:8.0
docker pull redis:7.2
docker pull rabbitmq:3.13-management
docker pull minio/minio:latest
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.11.4
```

::: warning ES 镜像不在 Docker Hub
Elasticsearch 官方镜像在 elastic 自家仓库 `docker.elastic.co`，国内镜像源不一定覆盖，失败多重试或换网络。
:::

## docker-compose.yml 全文

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: shiyi-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro

  redis:
    image: redis:7.2
    container_name: shiyi-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  rabbitmq:
    image: rabbitmq:3.13-management
    container_name: shiyi-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: shiyi
      RABBITMQ_DEFAULT_PASS: '以实际部署配置为准'
    ports:
      - "5672:5672"     # AMQP 协议端口，Java 客户端连这个
      - "15672:15672"   # 管理界面
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
      - ./rabbitmq/rabbitmq_delayed_message_exchange-3.13.0.ez:/opt/rabbitmq/plugins/rabbitmq_delayed_message_exchange-3.13.0.ez:ro
      - ./rabbitmq/enabled_plugins:/etc/rabbitmq/enabled_plugins:ro

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.4
    container_name: shiyi-es
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"   # 开发环境关安全认证，省去证书
      ES_JAVA_OPTS: "-Xms512m -Xmx512m" # 限制 ES 内存
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data

  minio:
    image: minio/minio:latest
    container_name: shiyi-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: '以实际部署配置为准'
    ports:
      - "9000:9000"     # S3 API
      - "9001:9001"     # 控制台
    volumes:
      - minio-data:/data

volumes:
  mysql-data:
  redis-data:
  rabbitmq-data:
  es-data:
  minio-data:
```

关键点：

- `ports` 左边是宿主机端口。本机已装 MySQL 占 3306 时改成 `"3307:3306"`
- 具名卷（volumes 段）做数据持久化：容器删了数据还在，也因此 compose **不会重复初始化**
- `./sql/init.sql` 挂到 `/docker-entrypoint-initdb.d/` 是 MySQL 镜像约定：首次初始化自动执行，`:ro` 只读

## RabbitMQ 延迟插件

官方镜像不带"延迟消息插件"，而"15 分钟未支付自动关单"全靠它：

1. 从 GitHub [rabbitmq-delayed-message-exchange releases](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases) 下载 `rabbitmq_delayed_message_exchange-3.13.0.ez`，放到 `deploy/rabbitmq/`
2. 同目录建 `enabled_plugins` 文件，内容一行（结尾有个点）：

```
[rabbitmq_delayed_message_exchange].
```

3. compose 里两个挂载：插件文件塞进插件目录、启用清单放到配置位。顺序别反——先有插件文件再启动

## 启动与验证

```bash
docker compose up -d    # 后台全起
docker compose ps       # 五个容器都应是 Up
```

| 服务 | 命令/地址 | 期望结果 |
| --- | --- | --- |
| Redis | `docker exec shiyi-redis redis-cli ping` | `PONG` |
| MySQL | `docker exec shiyi-mysql mysql -uroot -proot123 -e "use shiyi; show tables;"` | 8 张表 |
| RabbitMQ | 浏览器 `http://localhost:15672` | 管理界面，插件列表含 delayed message exchange |
| ES | 浏览器 `http://localhost:9200` | JSON，version 8.11.4 |
| MinIO | 浏览器 `http://localhost:9001` | 控制台 |

## 镜像加速（pull 超时时）

Docker Desktop → Settings → Docker Engine，JSON 里加：

```json
"registry-mirrors": ["https://docker.1ms.run", "https://docker.m.daocloud.io"]
```

Apply & Restart 后重新 pull。公共镜像源时灵时不灵，失效就换。

## ES 启动即退：vm.max_map_count

日志出现 `max virtual memory areas vm.max_map_count [65530] is too low`，PowerShell 执行：

```powershell
wsl -d docker-desktop -u root sysctl -w vm.max_map_count=262144
```

然后 `docker compose restart elasticsearch`。

::: warning
Docker 重启后这个设置会丢，要重跑一次。无解，Windows + WSL2 就这样，写进部署笔记反而是真实经验。
:::

## 常用运维命令

| 命令 | 作用 |
| --- | --- |
| `docker compose ps` | 查看容器状态 |
| `docker compose logs --tail 20 mysql` | 看某服务最后 20 行日志 |
| `docker compose restart elasticsearch` | 重启某服务 |
| `docker compose down` | 停止并删容器（数据卷保留） |
| `docker compose down -v` | ⚠️ 连数据卷一起删，本地库会被清空，慎用 |

## 小结

- compose 只拉缺失镜像 → 逐个 pull 是国内网络下的正确姿势
- init.sql 靠 `/docker-entrypoint-initdb.d/` 自动执行，只在**首次**初始化生效
- 延迟插件要提前放进镜像挂载，别等用到 MQ 那天再折腾
