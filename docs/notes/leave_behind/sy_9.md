---
title: 拾遗项目
description: 报错复盘：Boot 4 降级 3.5 两连错

---

# 报错复盘：Boot 4 降级两连错

> 接 MyBatis-Plus 时连环撞出两个报错，本质同源：工程是 Spring Boot 4 生成的，生态件还在 Boot 3 时代。完整还原案情，沉淀排查方法。

## 案发一：sqlSessionFactory is required

接完 MP 一启动：

```
Caused by: java.lang.IllegalArgumentException: Property 'sqlSessionFactory' or 'sqlSessionTemplate' are required
    at org.mybatis.spring.support.SqlSessionDaoSupport.checkDaoConfig(SqlSessionDaoSupport.java:125) ~[mybatis-spring-3.0.3.jar:3.0.3]
```

看起来像"你少配了什么"，实际完全不是。

**关键线索在堆栈的版本号里**：`spring-core-7.0.10` —— 工程底层是 Spring Framework 7，即 **Spring Boot 4**。而 `mybatis-plus-spring-boot3-starter:3.5.7` 捆绑的 `mybatis-spring 3.0.3` 诞生于 Spring 6 时代，装配 Mapper 时无法把 `SqlSessionFactory` 注入进来，启动半路就炸。

**解法**：pom 的 parent 从 4.x 降到 3.5.7（已写代码零改动，jakarta 注解全兼容）。

## 案发二：starter 版本 missing

parent 降完，构建又报：

```
'dependencies.dependency.version' for org.springframework.boot:spring-boot-starter-webmvc:jar is missing.
'dependencies.dependency.version' for org.springframework.boot:spring-boot-starter-webmvc-test:jar is missing.
```

Boot 4 连 **starter 名字都改了**：`spring-boot-starter-web` → `spring-boot-starter-webmvc`，测试 starter 按技术栈拆分成 `spring-boot-starter-webmvc-test`。这两个名字在 Boot 3.5 的版本清单（BOM）里不存在，Maven 找不到托管版本就要求显式写 version。

**解法**：改回 Boot 3 的名字——`spring-boot-starter-web` 和 `spring-boot-starter-test`（scope=test）。

## 排查方法论（这次学到的）

1. **框架兼容性报错，先读堆栈里的版本号**。`spring-core-7` + `mybatis-spring-3.0.3` 两个数字一放，案情就清楚了——大版本代差
2. 大版本没对齐时，**查任何配置都是白费**——先对版本，再谈配置
3. 报错信息会撒谎：`sqlSessionFactory is required` 引你去找配置，真相是版本代差

## 为什么不留在 Boot 4 升 MP

官方文档确认新版 MP 有 `mybatis-plus-spring-boot4-starter`，技术上可留 Boot 4。但不走这条路：

1. 后面还有 Sa-Token、LangChain4j、RabbitMQ starter 一串生态件，Boot 4 发布仅一年，适配成熟度参差，接下来几周会不停撞版本墙
2. 作品集要的是"每个组件都能讲清楚"，不是"用了最新版"。面试问"为什么 Boot 3.5"："生态兼容性与协作成本优先，3.5 是当前生产主流线"就是满分答案
3. 踩坑时间预算应该留给抢课模块那种真正出面试故事的地方

## 版本基线（修复后）

| 组件 | 版本 |
| --- | --- |
| JDK | 17 |
| Spring Boot | 3.5.7 |
| MyBatis-Plus | 3.5.7（mybatis-plus-spring-boot3-starter） |
| Sa-Token | 1.46.0（sa-token-spring-boot3-starter） |
| MySQL | 8.0（Docker） |

## 小结

- 生成工程时看一眼 Boot 大版本号，initializr 默认会跟着最新走
- 两个案子一句话总结：**Boot 4 的身、Boot 3 的魂，谁先对齐谁活**
- 引入任何新 starter 前，先确认它的"适配的 Boot 大版本"
