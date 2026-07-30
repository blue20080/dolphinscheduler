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

# ETL 安装与启动

本文档适用于 `etl-*-bin.tar.gz` 二进制安装包，不包含 Docker 部署方式。

## 一、安装前准备

建议环境：

- 64 位 Linux；macOS 可用于本机验证，不建议作为生产服务器。
- JDK 8 或 JDK 11，并正确配置 `JAVA_HOME`。
- Standalone 验证环境建议至少 8 GB 内存。
- 生产部署需要 PostgreSQL 8.2.15+ 和 ZooKeeper 3.8.x。
- 确保服务器的 `8080` 端口可被需要访问 ETL 的客户端连接。

检查 Java：

```shell
export JAVA_HOME=/实际的/JDK目录
export PATH="$JAVA_HOME/bin:$PATH"
java -version
```

## 二、解压安装包

```shell
tar -xzf etl-*-bin.tar.gz
chmod -R 755 etl-*-bin
cd etl-*-bin
```

安装包解压后的目录名类似于 `etl-dev-SNAPSHOT-bin`。

> 安装包内部暂时保留 `dolphinscheduler-daemon.sh`、`dolphinscheduler_env.sh`
> 等兼容脚本名。它们是程序内部启动入口，请勿自行改名。产品名称、安装包名称和浏览器 URL 均为 ETL。

## 三、Standalone 快速验证

Standalone 自带 H2 数据库和测试用注册中心，适合安装验证和功能体验，不建议用于生产环境。

### 1. 启动

```shell
export JAVA_HOME=/实际的/JDK目录
bash ./bin/dolphinscheduler-daemon.sh start standalone-server
```

### 2. 检查状态和日志

```shell
bash ./bin/dolphinscheduler-daemon.sh status standalone-server
tail -f standalone-server/logs/standalone-server-*.out
```

看到服务监听 `8080` 端口后，在浏览器访问：

```text
http://服务器IP:8080/etl/ui/
```

页面会进入：

```text
http://服务器IP:8080/etl/ui/login
```

默认账号：

```text
用户名：etl
密码：123456
```

首次登录后应立即修改默认密码。

### 3. 停止或重启

```shell
bash ./bin/dolphinscheduler-daemon.sh stop standalone-server
bash ./bin/dolphinscheduler-daemon.sh start standalone-server
```

Standalone 默认使用内存数据库，服务停止后测试数据可能丢失。需要保存数据时，请使用下面的生产部署方式。

## 四、生产部署

以下示例使用 PostgreSQL 和 ZooKeeper，在一台服务器启动 API、Master、Worker、Alert 四个进程。多机部署时，将相同安装包和配置分发到各服务器，再按服务器角色启动对应进程。

### 1. 创建部署用户

使用 root 或有 sudo 权限的账号执行。`chown` 后面的路径必须替换为实际的 ETL 解压目录：

```shell
useradd -m -s /bin/bash etl
passwd etl
chown -R etl:etl /实际安装路径/etl-*-bin
su - etl
cd /实际安装路径/etl-*-bin
```

ETL 的多租户任务会切换到对应 Linux 租户执行。生产环境应按照公司的权限规范，为 ETL 部署用户配置所需的 sudo 权限。

### 2. 创建 PostgreSQL 元数据库

使用 PostgreSQL 管理员账号执行：

```sql
CREATE USER etl WITH PASSWORD '请替换为强密码';
CREATE DATABASE etl OWNER etl ENCODING 'UTF8';
```

同时确认 PostgreSQL 的 `pg_hba.conf` 允许 ETL 服务器使用该账号连接数据库。

### 3. 启动 ZooKeeper

确保 ZooKeeper 已启动，并记录连接地址，例如：

```text
zk01.example.com:2181
```

### 4. 配置运行环境

编辑 `bin/env/dolphinscheduler_env.sh`，添加或修改以下内容：

```shell
export JAVA_HOME=/实际的/JDK目录

export DATABASE=postgresql
export SPRING_PROFILES_ACTIVE=postgresql
export SPRING_DATASOURCE_URL="jdbc:postgresql://数据库地址:5432/etl"
export SPRING_DATASOURCE_USERNAME=etl
export SPRING_DATASOURCE_PASSWORD='请替换为数据库密码'

export REGISTRY_TYPE=zookeeper
export REGISTRY_ZOOKEEPER_CONNECT_STRING="zk01.example.com:2181"

export SPRING_CACHE_TYPE=none
export SPRING_JACKSON_TIME_ZONE=Asia/Shanghai
```

配置文件中的值会被复制到各服务目录。修改后应重新执行服务启动命令，不要只修改某一个服务目录中的临时副本。

### 5. 初始化数据库

切换到 ETL 安装目录，以部署用户执行：

```shell
bash tools/bin/upgrade-schema.sh
```

脚本成功结束后，数据库中应生成 ETL 所需的表结构和初始管理员账号。

### 6. 启动服务

```shell
bash ./bin/dolphinscheduler-daemon.sh start master-server
bash ./bin/dolphinscheduler-daemon.sh start worker-server
bash ./bin/dolphinscheduler-daemon.sh start alert-server
bash ./bin/dolphinscheduler-daemon.sh start api-server
```

查看状态：

```shell
bash ./bin/dolphinscheduler-daemon.sh status master-server
bash ./bin/dolphinscheduler-daemon.sh status worker-server
bash ./bin/dolphinscheduler-daemon.sh status alert-server
bash ./bin/dolphinscheduler-daemon.sh status api-server
```

查看日志：

```shell
tail -f master-server/logs/master-server-*.out
tail -f worker-server/logs/worker-server-*.out
tail -f alert-server/logs/alert-server-*.out
tail -f api-server/logs/api-server-*.out
```

### 7. 登录 ETL

```text
http://服务器IP:8080/etl/ui/
```

ETL 已直接使用 `/etl` 作为后端上下文路径，不需要为了转换旧路径而安装 Nginx。使用 HTTPS、统一域名或负载均衡时，仍可按公司的基础设施规范配置网关。

### 8. 停止服务

```shell
bash ./bin/dolphinscheduler-daemon.sh stop api-server
bash ./bin/dolphinscheduler-daemon.sh stop alert-server
bash ./bin/dolphinscheduler-daemon.sh stop worker-server
bash ./bin/dolphinscheduler-daemon.sh stop master-server
```

## 五、常见问题

### 页面无法打开

```shell
curl -I http://127.0.0.1:8080/etl/
tail -n 200 api-server/logs/api-server-*.out
```

正常情况下 `/etl/` 返回 302，并跳转到 `/etl/ui/`。请同时检查防火墙和 `8080` 端口占用情况。

### Java 启动失败

确认 `JAVA_HOME` 指向 JDK 根目录，而不是 JRE 或 `bin` 目录：

```shell
test -x "$JAVA_HOME/bin/java" && "$JAVA_HOME/bin/java" -version
```

### 数据库初始化失败

检查 `bin/env/dolphinscheduler_env.sh` 中的数据库地址、账号和密码，并确认 ETL 服务器可以连接 PostgreSQL 的 `5432` 端口。

### 使用 MySQL

MySQL JDBC 驱动不随安装包分发。使用 MySQL 作为元数据库或业务数据源时，需要将兼容版本的 JDBC 驱动放入相关服务和 `tools/libs` 目录，再执行数据库初始化。
