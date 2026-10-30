---
title: 拾遗项目
description: 统一响应

---

# 统一响应

```
package com.shiyi.common;

import lombok.Data;

@Data
public class Result<T> {
    private int code;    // 0 = 成功，非 0 = 失败
    private String msg;
    private T data;

    public static <T> Result<T> ok() {
        return ok(null);
    }

    public static <T> Result<T> ok(T data) {
        Result<T> r = new Result<>();
        r.code = 0;
        r.msg = "success";
        r.data = data;
        return r;
    }

    public static <T> Result<T> fail(int code, String msg) {
        Result<T> r = new Result<>();
        r.code = code;
        r.msg = msg;
        return r;
    }
}
```



1. 泛型 T 是为了 data 想装什么装什么，前端拿到的永远是同一种结构 {code, msg, data}。这个约定一旦定下，前后端联调的成本直线下降——前端只需要写一次拦截器判断 code。
2. 静态工厂方法 ok()/fail() 代替构造器，调用方写起来是 Result.ok(list)，可读性好。
3. code 用业务码而不是直接透传 HTTP 状态码。HTTP 200 + body 里 code=400 是国内主流做法，好处是 HTTP 层永远是通的、错误分类由后端业务码精细控制。有面试官会挑战这个设计，你就答：“Restful 纯派用 HTTP 状态码也可以，但我们前端拦截器基于业务码做了统一提示，两套约定自洽即可，关键是全团队一致。”