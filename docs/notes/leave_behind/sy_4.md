---
title: 拾遗项目
description: 业务异常

---

# 业务异常

```
package com.shiyi.common;

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



1. 继承 RuntimeException 而不是 Exception——非受检异常不强制上层 try-catch 或 throws，业务代码里可以随手 throw new BusinessException("库存不足") 而不污染方法签名。
2. 携带 code 字段，让“哪个接口错了、错在哪类”能传给全局处理器转成统一响应。

以后所有业务失败统一这么写：throw new BusinessException("该场次已抢完")。这一行就是你以后所有业务逻辑的报错姿势，先养成肌肉记忆。

