<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# 达梦 DM8 环境记录与 ETL 接入

## 一、安装信息

| 项目 | 信息 |
|---|---|
| 安装包 | `dm8_20260710_x86_rh7_64.zip` |
| 安装路径 | `/opt/dm8` |
| 数据路径 | `/home/dmdba/dmdata/DMSERVER` |
| 安装用户 | `dmdba / dmdba` |
| 用户组 | `dinstall`，GID `10001` |

## 二、数据库信息

| 项目 | 信息 |
|---|---|
| 数据库名 | `DMSERVER` |
| 实例名 | `DMSERVER` |
| 端口 | `5236` |
| 管理员 | `SYSDBA / Dameng123` |
| 审计员 | `SYSAUDITOR / Dameng123` |
| 字符集 | `UTF-8`，`CHARSET=1` |
| 大小写 | 敏感，`CASE_SENSITIVE=1` |
| 页大小 | `32KB` |
| 许可证到期 | `2027-07-07` |
| 实测版本 | `DM DBMS 8.1.5.60` |
| 兼容模式 | 原生达梦，`COMPATIBLE_MODE=0` |

## 三、服务管理命令

```shell
systemctl start DmServiceDMSERVER
systemctl stop DmServiceDMSERVER
systemctl restart DmServiceDMSERVER
systemctl status DmServiceDMSERVER
systemctl enable DmServiceDMSERVER
```

服务已经启用开机自启。

## 四、管理员连接方式

命令行连接：

```shell
/opt/dm8/bin/disql SYSDBA/Dameng123@localhost:5236
```

管理员 JDBC 连接：

```text
jdbc:dm://ddp-master:5236
用户名：SYSDBA
密码：Dameng123
```

原登记 JDBC 串为 `jdbc:dm://ddp-master:5236/DMSERVER`。达梦 JDBC URL 的路径部分表示 Schema，`SYSDBA` 下没有 `DMSERVER` Schema 时该地址会报“模式不存在”。管理员连接应省略路径。

驱动目录：

```text
/opt/dm8/drivers/jdbc/
```

当前服务端提供 `DmJdbcDriver6.jar`、`DmJdbcDriver7.jar`、`DmJdbcDriver8.jar` 和 `DmJdbcDriver11.jar`。ETL 发行包使用 Maven 驱动 `DmJdbcDriver18 8.1.3.140`，已在该实例上完成连接验证。

## 五、配置文件路径

| 文件 | 路径 |
|---|---|
| 数据库配置 | `/home/dmdba/dmdata/DMSERVER/dm.ini` |
| 控制文件 | `/home/dmdba/dmdata/DMSERVER/dm.ctl` |
| 服务配置 | `/etc/dm_svc.conf` |
| systemd 服务 | `/usr/lib/systemd/system/DmServiceDMSERVER.service` |

## 六、ETL 专用 Schema

不要使用 `SYSDBA` 作为 ETL 日常运行账号。首次安装时由管理员执行：

```sql
CREATE USER ETL IDENTIFIED BY "Etl123456" DEFAULT TABLESPACE MAIN;
GRANT RESOURCE TO ETL;
GRANT SELECT ON SYS.V$SESSIONS TO ETL;
GRANT SELECT ON SYS.V$DM_INI TO ETL;
```

后两项只读权限供监控中心读取会话数量和 `MAX_SESSIONS`，不会授予修改系统参数的权限。

ETL 连接信息：

```text
jdbc:dm://ddp-master:5236/ETL
用户名：ETL
密码：Etl123456
```

运行环境：

```shell
export DATABASE=dameng
export SPRING_PROFILES_ACTIVE=dameng
export SPRING_DATASOURCE_URL="jdbc:dm://ddp-master:5236/ETL"
export SPRING_DATASOURCE_USERNAME=ETL
export SPRING_DATASOURCE_PASSWORD='Etl123456'
```

初始化：

```shell
bash tools/bin/upgrade-schema.sh
```

当前达梦支持基线是新安装的 ETL `3.5.0` 元数据结构。历史 MySQL/PostgreSQL 元数据库迁移到达梦时，应使用数据迁移方案，不要直接套用跨数据库升级脚本。
