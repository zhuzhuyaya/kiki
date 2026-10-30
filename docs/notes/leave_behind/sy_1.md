---
title: 拾遗项目
description: 拾遗项目设计

---

# 拾遗

> 让非遗在经历时光的同时，持续的发扬传承下去

## 技术栈

| 层        | 选型                                            | 说明                                                         |
| --------- | ----------------------------------------------- | ------------------------------------------------------------ |
| 语言/框架 | JDK 17 + Spring Boot 3.x                        | 2026 年别用 2.x，面试会问                                    |
| ORM       | MyBatis-Plus                                    |                                                              |
| 鉴权      | Sa-Token + RBAC                                 | 比 Spring Security 轻，注解鉴权够用                          |
| 缓存      | Redis 7 (Lettuce)                               | 缓存、库存预扣、分布式锁、限流                               |
| MQ        | RabbitMQ + 延迟消息插件                         | 异步下单、超时关单、ES 同步                                  |
| 搜索      | Elasticsearch 8                                 | 课程全文检索 + dense_vector 向量检索（RAG 复用同一套 ES，不加新中间件） |
| 文件      | MinIO                                           | 自建免费，兼容 S3 协议                                       |
| AI        | LangChain4j + Ollama(bge-m3 向量 / qwen 对话)   | RAG 问答；部署在服务器则换 DashScope API                     |
| 数据库    | MySQL 8                                         |                                                              |
| 前端      | Vue3 + Vite + Pinia + Element Plus + 高德 JSAPI | 前台（用户）+ 后台（管理/传承人）两个 SPA                    |
| 压测      | JMeter                                          | 出数字：改造前后 QPS/RT 对比                                 |
| 部署      | Docker Compose → 阿里云轻量 2C4G                | 一键起全环境                                                 |

## 
