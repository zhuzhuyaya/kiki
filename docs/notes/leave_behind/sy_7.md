---
title: 拾遗项目
description: MyBatis-Plus 接入

---

# MyBatis-Plus 接入

> 用 MP 把第一条数据库链路跑通：实体 + Mapper 零 SQL 完成增删改查，并学会看它生成的 SQL 日志。

## 概念 30 秒

MP 是 MyBatis 的增强：实体类标注解 → 启动时反射拼出单表 CRUD SQL → 塞进继承 `BaseMapper` 的接口。条件查询用 `LambdaQueryWrapper` 传方法引用（编译期检查字段名）。复杂多表 SQL 仍手写。

## 依赖（两个必踩坑）

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.7</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
</dependency>
```

1. **starter 名必须带 `spring-boot3`**。老的 `mybatis-plus-boot-starter` 配 Boot 3 报 `Invalid value type for attribute 'factoryBeanObjectType'`，报错信息完全指向别处，极容易迷路
2. 版本写死 3.5.7。3.5.9 之后 starter 拆分要多引包，学习期没必要碰

MySQL 驱动版本走 Boot 官方 BOM，不写。

## application.yml

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/shiyi?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai
    username: root
    password: root123

mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl   # 开发期打印 SQL
```

- `serverTimezone=Asia/Shanghai`：MySQL 8 驱动必指定时区，否则时间差 8 小时
- `allowPublicKeyRetrieval=true`：`caching_sha2_password` 认证在非 SSL 下首次要取公钥，不加必报错
- `log-impl` 让每条 SQL + 参数进控制台，学习期最好的老师

连接池没配：Boot 默认自带 HikariCP（公认最快），零配置可用。

## 分页插件（不装 = 悄悄查全表）

```java
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

原理：MP 分页靠 MyBatis **拦截器**在 SQL 执行前把你的语句包一层 `LIMIT`，再追加 `COUNT(*)`。不注册拦截器，`selectPage` 会**悄悄变成查全表**——不报错但数据全量返回，这种"不报错的错误"最致命。

## 实体类

```java
@Data
@TableName("user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String phone;
    private String passwordHash;
    private String nickname;
    private String avatar;
    private String role;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- `@TableId(type = IdType.AUTO)`：数据库自增，插入后 id 自动回填
- `passwordHash` ↔ `password_hash`：**驼峰 ↔ 下划线自动映射**，所以不用写字段注解
- `LocalDateTime` 对应 `DATETIME`，别再用 `Date`
- 密码字段绝不能出现在返回前端的接口里（第 3 课用 VO 解决）

## Mapper 与扫描

```java
public interface UserMapper extends BaseMapper<User> {
}
```

启动类加 `@MapperScan("com.shiyi.module.*.mapper")` 一次扫全，新模块自动覆盖，不用逐个标 `@Mapper`。

## 冒烟接口

```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserMapper userMapper;

    @GetMapping
    public Result<Page<User>> list(long page, long size) {
        Page<User> result = userMapper.selectPage(new Page<>(page, size), null);
        return Result.ok(result);
    }

    @GetMapping("/inheritors")
    public Result<List<User>> inheritors() {
        return Result.ok(userMapper.selectList(
                new LambdaQueryWrapper<User>().eq(User::getRole, "INHERITOR")));
    }
}
```

- `@RequiredArgsConstructor` 为 final 字段生成构造器 + Spring 构造器注入：字段不可变、方便单测，**官方推荐姿势**
- `Page` 对象带 `records`（数据）、`total`（总数）
- `User::getRole` 等价 `WHERE role='INHERITOR'`，重构改名字段时编译器替你揪错

## 看懂 SQL 日志

```
==>  Preparing: SELECT COUNT(*) AS total FROM user
==>  Preparing: SELECT id,phone,... FROM user LIMIT ?
==> Parameters: 10(Long)
<==      Total: 3
```

`Preparing` 是生成的 SQL，`Parameters` 是绑定参数。亲眼确认"我没写 SQL，它替我生成了什么"。

## 数据库设计要点回顾

- 库存字段在 `course_session.remaining_stock`，扣减必带 `WHERE remaining_stock > 0`（DB 层防超卖兜底）
- 订单表 `uk_user_session` 唯一索引 = 一人一场一单的最终防线
- 订单表叫 `order_info`：`ORDER` 是 MySQL 保留字，表名用它每条 SQL 都要反引号
- 金额用 `DECIMAL(10,2)` 不用 DOUBLE（浮点算钱有精度事故）
- 订单冗余 `course_id`：空间换时间，评价/列表免联三张表

## 小结

- starter 名 + 版本是 MP 接入两大坑，先对齐再写代码
- 分页插件必须注册，否则分页静默失效
- 开发期开着 SQL 日志写代码，所见即所得
