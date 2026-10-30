---
title: 拾遗项目
description: 数据库设计

---

# 拾遗数据库设计

| 表               | 关键字段                                                     | 说明                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `user`           | id, phone, nickname, password_hash, avatar, role, status     | 手机号+密码登录                                              |
| `inheritor`      | id, user_id, name, heritage_item_id, bio, verify_status, contact | 传承人入驻，需管理员认证                                     |
| `heritage_item`  | id, name, category, level(国家/省/市), region, cover, description | 非遗项目字典，种子数据内置                                   |
| `course`         | id, inheritor_id, heritage_item_id, title, cover, images, description, tags, address, lng, lat, status(待审核/上架/下架), sales | 经纬度用于地图展示                                           |
| `course_session` | id, course_id, start_time, duration_min, price, capacity, **remaining_stock**, status | **库存字段在此表**，扣减 SQL 带 `where remaining_stock > 0` 兜底 |
| `order`          | id, order_no, user_id, session_id, course_id, quantity, amount, status, pay_time, checkin_code | **唯一索引 uk_user_session(user_id, session_id)** = 一人一场限购 1 张，数据库层兜底防重复下单 |
| `course_review`  | id, order_id, user_id, course_id, rating(1-5), content, images, reply | 订单核销后才可评价                                           |
| `message`        | id, user_id, title, content, is_read                         | 站内信（抢课结果、审核通知）                                 |



Redis Key 规划：

| Key                         | 类型         | 用途                                     |
| --------------------------- | ------------ | ---------------------------------------- |
| `seckill:stock:{sessionId}` | string       | 场次库存预扣，Lua 原子 -1                |
| `seckill:buyer:{sessionId}` | set          | 一人一单幂等（抢购时快速判重）           |
| `cache:course:detail:{id}`  | string(json) | 课程详情缓存，TTL 30min+随机秒（防雪崩） |
| `cache:hot:course`          | zset         | 首页热门榜，定时任务按销量刷新           |
| `ratelimit:{userId}:{api}`  | string(计数) | 抢购接口限流，Lua 滑动窗口               |



MQ 拓扑：

| Exchange                          | Queue            | 用途                          |
| --------------------------------- | ---------------- | ----------------------------- |
| `shiyi.order` (direct)            | `order.create`   | 抢购成功消息 → 消费者事务落库 |
| `shiyi.delay` (x-delayed-message) | `order.close`    | 延迟 15min 关单 + 回补库存    |
| `shiyi.es` (fanout)               | `es.course.sync` | 课程上架/修改 → 同步 ES 索引  |