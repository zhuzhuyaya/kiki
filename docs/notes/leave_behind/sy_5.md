---
title: 拾遗项目
description: 全局异常处理器

---

# 全局异常处理器

```
package com.shiyi.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常：预期内的失败，warn 级别即可，不打堆栈 */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    /** 参数校验失败：取第一条错误提示返回给前端 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        FieldError fe = e.getBindingResult().getFieldError();
        String msg = fe == null ? "参数错误" : fe.getDefaultMessage();
        return Result.fail(400, msg);
    }

    /** 兜底：预期外的异常，error 级别 + 完整堆栈，但绝不把堆栈返回给前端 */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleOther(Exception e) {
        log.error("系统异常", e);
        return Result.fail(500, "系统繁忙，请稍后重试");
    }
}package com.shiyi.common;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(String msg) {
        this(400, msg);
    }

    public BusinessException(int code, String msg) {
        super(msg);
        this.code = code;
    }
}
```



1. @RestControllerAdvice + @ExceptionHandler 的原理是 Spring MVC 的 AOP 式拦截：任何 controller 抛出的异常都会被路由到这里匹配的方法。它把“异常 → 响应”的转换集中到一处，业务代码只管 throw。
2. 三个 handler 的日志级别是刻意区分的：业务异常（用户余额不足这种）天天发生，打 error 级别会把告警系统刷爆，所以 warn 且不打堆栈；兜底异常是 bug，必须 error + 完整堆栈方便排查。这个区分体现的是日志素养，面试聊排查问题时是加分细节。
3. 兜底 handler 返回给前端的永远是“系统繁忙”，真实异常信息只进日志不进响应——把堆栈返回给前端等于把类名、包结构、可能还有 SQL 报错送出去，是安全漏洞。

