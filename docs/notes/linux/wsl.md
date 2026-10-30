---
title: WSL 系统管理
description: WSL 安装、启动、发行版管理、跨系统执行命令
---

# 01 WSL 系统管理

> WSL 本体装在 Windows 层面；每个发行版（Ubuntu 等）可以指定虚拟磁盘的存放目录。

## 查看状态

```bash
wsl --version          # WSL 版本信息（内核、WSLg 等）
wsl --status           # 默认发行版、默认 WSL 版本
wsl -l -v              # 已安装的发行版列表及运行状态
wsl --list --online    # 可在线安装的发行版列表
```

## 安装发行版到指定目录

```bash
wsl --install Ubuntu-24.04 --location 'D:\linux\Ubuntu-24.04' --name Ubuntu --no-launch
```

- `--location`：虚拟磁盘（ext4.vhdx）的存放目录，不占用 C 盘
- `--name`：发行版注册名称，之后都用这个名字引用
- `--no-launch`：装完不自动启动（跳过首次交互式用户创建向导）
- 首次手动启动时（`wsl -d Ubuntu`）会引导创建 Linux 用户名和密码

## 启动与进入

```bash
wsl -d Ubuntu          # 进入指定发行版（退出用 exit）
wsl                    # 进入默认发行版
exit                   # 退出回到 Windows
```

## 从 Windows 直接执行 Linux 命令（不进入交互环境）

```bash
wsl -d Ubuntu -- <命令>                    # 以默认用户执行
wsl -d Ubuntu -u root -- <命令>            # 以 root 执行（改密码、装软件很好用）
wsl -d Ubuntu -- docker ps                 # 示例：直接调用 WSL 里的 docker
```

## 关闭与卸载

```bash
wsl --shutdown             # 关闭整个 WSL 虚拟机（所有发行版停止）
wsl --unregister Ubuntu    # 彻底删除发行版，连同其虚拟磁盘文件一起清除
```

## Git Bash 调用 wsl.exe 的注意事项

在 Git Bash 里给 wsl.exe 传 Linux 路径（如 `/mnt/d/...`）会被 MSYS 自动转换成 Windows 路径导致报错（`No such file or directory`）。解决办法：

```bash
MSYS_NO_PATHCONV=1 wsl -d Ubuntu -u root -- bash /mnt/d/linux/install-docker.sh
```

复杂命令建议写成脚本文件（放在 D 盘，WSL 里经 `/mnt/d/...` 访问）再执行，避免引号转义问题。
