---
title: Docker 安装与镜像加速
description: 官方 apt 源安装、daemon.json 镜像加速器、服务管理
---

# 03 Docker 安装与镜像加速

> 本机 Docker Engine 29.9.2 安装在 WSL Ubuntu 24.04 内部（非 Docker Desktop），
> 安装脚本存档：`D:\linux\install-docker.sh`。

## 从官方 apt 源安装（Ubuntu 24.04）

```bash
# 1. 安装依赖
sudo apt-get update
sudo apt-get install -y ca-certificates curl

# 2. 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 3. 添加 apt 仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

# 4. 安装
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# 5. 启动并设为开机自启（WSL 已启用 systemd）
sudo systemctl enable --now docker

# 6. 当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER
```

## 服务管理

```bash
systemctl is-active docker    # 查看服务状态
sudo systemctl restart docker # 重启 Docker（改了 daemon.json 后必须执行）
sudo systemctl enable --now docker  # 启动 + 开机自启
```

## 镜像加速器配置

国内网络无法直连 Docker Hub（`registry-1.docker.io` 连接被拒），需配置加速器。

**先测哪些加速器可用**（返回 401 或 302 表示存活，000 表示不通）：

```bash
curl -m 6 -s -o /dev/null -w '%{http_code}' https://docker.m.daocloud.io/v2/
```

**配置 `/etc/docker/daemon.json`**（当前生效配置）：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1ms.run"
  ]
}
```

改完执行 `sudo systemctl restart docker` 生效。加速器失效时换上面测通的其他地址即可。

## 验证

```bash
docker --version            # Docker 版本
docker compose version      # Compose 插件版本
docker run --rm hello-world # 端到端测试：拉取并运行测试容器
```
