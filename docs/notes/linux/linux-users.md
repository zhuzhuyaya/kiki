---
title: Linux 用户与密码
description: 改 root 密码、用户切换、用户组管理
---

# 02 Linux 用户与密码

> 本机环境：WSL Ubuntu 24.04，普通用户 `peter`（sudo 组），root 默认无密码。

## 修改 root 密码

```bash
# 常规方式：在 Ubuntu 里用自己的 sudo 用户执行
sudo passwd root
# 先输入当前用户密码（sudo 验证），再连续输两次新的 root 密码

# 免 sudo 方式：从 Windows 直接以 root 身份重设（忘了密码也有效）
wsl -d Ubuntu -u root passwd root
```

WSL 的特性：可以从 Windows 侧直接指定以 root 启动，因此即使没跑过首次启动向导、忘了所有密码，也能随时重设 root。

## 用户切换

```bash
su -            # 切换到 root（输入 root 密码验证），exit 退出
su - peter      # 切换到指定用户
sudo <命令>     # 以 root 权限执行单条命令（输入自己的密码）
```

## 用户组管理

```bash
sudo usermod -aG docker $USER   # 把当前用户加入 docker 组（免 sudo 用 docker）
getent passwd 1000              # 查看 uid=1000 的用户是否存在
```

注意：加入用户组后需要**重新登录**（新开的 WSL 会话）才生效。
