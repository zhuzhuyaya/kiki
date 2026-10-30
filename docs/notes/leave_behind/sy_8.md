---
title: 拾遗项目
description: 注册登录与 Sa-Token 鉴权

---

# 注册登录与 Sa-Token 鉴权

> 注册发 token、全局登录拦截、按角色放行（RBAC），并补上"密码泄进响应 JSON"的安全洞。

## PO / DTO / VO：接口数据流的规矩

```
DTO（进，带校验） → Entity（存，对应表） → VO（出，想给什么给什么）
```

- **Entity** 只进数据库，**不出接口**
- **DTO** 接口入参，校验注解写在它身上
- **VO** 接口出参，密码隔离靠"出接口时转 VO"，不是靠前端自觉

## 依赖

```xml
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-spring-boot3-starter</artifactId>
    <version>1.46.0</version>
</dependency>
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.8.32</version>
</dependency>
```

## DTO / VO

```java
@Data
public class RegisterDTO {

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1\\d{10}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 32, message = "密码长度需在 6~32 位之间")
    private String password;

    @NotBlank(message = "昵称不能为空")
    @Size(max = 50, message = "昵称最长 50 字")
    private String nickname;
}
```

```java
@Data
public class UserVO {
    private Long id;
    private String phone;
    private String nickname;
    private String avatar;
    private String role;    // 注意：没有 passwordHash
}
```

`LoginDTO`（phone/password 各一个 @NotBlank）：

```java
@Data
public class LoginDTO {

    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "密码不能为空")
    private String password;
}
```

`LoginVO`（登录成功返回给前端的两个值）：

```java
@Data
@AllArgsConstructor
public class LoginVO {
    private String tokenName;   // 前端请求头该叫什么：Authorization
    private String tokenValue;  // 请求头该发什么：Bearer xxx 里的 xxx
}
```

## Service 核心逻辑

```java
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;

    @Override
    public void register(RegisterDTO dto) {
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getPhone, dto.getPhone()));
        if (count > 0) {
            throw new BusinessException("手机号已被注册");
        }
        User user = new User();
        user.setPhone(dto.getPhone());
        user.setNickname(dto.getNickname());
        user.setRole("USER");
        user.setPasswordHash(BCrypt.hashpw(dto.getPassword()));   // 自带随机盐
        userMapper.insert(user);
    }

    @Override
    public LoginVO login(LoginDTO dto) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getPhone, dto.getPhone()));
        // 空密码守卫：种子账号 password_hash 是空串，checkpw 遇非法密文会抛异常
        if (user == null || user.getPasswordHash() == null || user.getPasswordHash().isBlank()
                || !BCrypt.checkpw(dto.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("手机号或密码错误");
        }
        StpUtil.login(user.getId());
        return new LoginVO(StpUtil.getTokenName(), StpUtil.getTokenValue());
    }

    @Override
    public UserVO me() {
        User user = userMapper.selectById(StpUtil.getLoginIdAsLong());
        if (user == null) {
            throw new BusinessException(401, "登录已失效，请重新登录");
        }
        return BeanUtil.copyProperties(user, UserVO.class);   // 密码到此为止
    }
}
```

安全设计三连（全是面试题）：

- **BCrypt 而非 MD5**：自带随机盐（彩虹表失效）+ 刻意慢（暴力破解贵）。同密码两次注册密文不同
- **登录失败提示合并**：不区分"账号不存在/密码错误"，防撞库枚举
- **比对在内存完成**，数据库永远只见密文

## Controller：@Valid 唤醒第 1 课的校验 handler

```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterDTO dto) {
        authService.register(dto);
        return Result.ok();
    }

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.ok(authService.login(dto));
    }

    @GetMapping("/me")
    public Result<UserVO> me() {
        return Result.ok(authService.me());
    }
}
```

`@Valid` 触发 DTO 校验，失败抛 `MethodArgumentNotValidException` → 第 1 课埋的全局 handler 自动接住。注意 `/me` 是 GET 且**不需要参数**——身份从 token 里来（`StpUtil.getLoginIdAsLong()`），不从参数里来，这是无状态鉴权的基本姿势。

## Sa-Token 配置与拦截器

```yaml
sa-token:
  token-name: Authorization
  token-prefix: Bearer        # 前端发 Authorization: Bearer xxx
  timeout: 2592000            # 30 天
  is-read-cookie: false       # 前后端分离走 header
  is-concurrent: true         # 允许多端在线
```

```java
@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/v1/auth/login", "/api/v1/auth/register");
    }
}
```

原则：**默认全锁死，再开门**（先 `/api/**` 全拦截，白名单放行注册/登录），比"默认全开逐个锁"安全。

## RBAC：角色数据源 StpInterface

Sa-Token 查 `@SaCheckRole("ADMIN")` 时会问"这个用户有什么角色"，答案由你提供：

```java
@Component
@RequiredArgsConstructor
public class StpInterfaceImpl implements StpInterface {

    private final UserMapper userMapper;

    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        User user = userMapper.selectById(Long.valueOf(loginId.toString()));
        return user == null ? List.of() : List.of(user.getRole());
    }

    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        return List.of();   // 细粒度权限点以后再加
    }
}
```

特性：**每次实时查库**——数据库里改了 role，不用重新登录立即生效（验证过）。

## 给接口上锁 + 换 VO 出参

```java
@SaCheckRole("ADMIN")
@GetMapping
public Result<Page<UserVO>> list(long page, long size) {
    Page<User> p = userMapper.selectPage(new Page<>(page, size), null);
    Page<UserVO> vo = new Page<>(p.getCurrent(), p.getSize(), p.getTotal());
    vo.setRecords(BeanUtil.copyToList(p.getRecords(), UserVO.class));
    return Result.ok(vo);
}
```

响应 JSON 里从此没有 `passwordHash`——安全洞正式补上。

## 补 401 / 403 语义

```java
@ExceptionHandler(NotLoginException.class)
public Result<Void> handleNotLogin(NotLoginException e) {
    return Result.fail(401, "未登录或登录已过期");
}

@ExceptionHandler(NotRoleException.class)
public Result<Void> handleNotRole(NotRoleException e) {
    return Result.fail(403, "无权访问");
}
```

不处理的话会掉进兜底 handler 变成 500，语义全错。401 = 没身份，403 = 有身份没权限。

## 验证清单

1. 注册 → 成功；再注册同手机号 → `手机号已被注册`
2. 登录 → 拿到 tokenValue
3. 带 `Authorization: Bearer <token>` 访问 `/me` → 返回用户信息且**无密码字段**
4. 不带 token → 401
5. USER 角色访问 `/users` → 403
6. SQL 改自己 role 为 ADMIN，**不重新登录**再访问 → 通了（实时查库的证明）

## 小结

- 密码隔离靠 VO，不是靠前端"别用那个字段"
- 默认全锁 + 白名单放行是鉴权设计第一原则
- 401/403 各归各位，别让 500 兜底吃掉鉴权异常
