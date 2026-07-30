# 介绍

这个插件使用 JDBC 作为注册中心，并复用 ETL api-server YAML 中的数据库配置。

# 如何使用

1. 初始化数据库

- 如果你使用 MySQL，你可以直接执行 SQL 脚本 `src/main/resources/mysql_registry_init.sql`.

- 如果你使用 PostgreSQL，你可以直接执行 SQL 脚本 `src/main/resources/postgresql_registry_init.sql`.

2. 修改配置

需要在 master/worker/api 的 application.yml 中设置属性

```yaml
registry:
  type: jdbc
```

完成这两步后即可启动 ETL 集群，集群将使用 MySQL 作为注册中心存储服务器元数据。

注意: 如果您使用mysql数据库，您需要将 `mysql-connector-java.jar` 添加到 DS 的类路径中，因为这个插件不会在发行版中捆绑此驱动程序。

## 可选配置

```yaml
registry:
  type: jdbc
  # Used to schedule refresh the heartbeat.
  heartbeat-refresh-interval: 3s
  # Once the client's heartbeat is not refresh in this time, the server will consider the client is offline.
  session-timeout: 60s
```

## 为 worker 配置数据源

由于Worker服务默认不包含数据源，因此你需要在 worker 的 application.yml 中为注册中心设置数据源属性

### 使用 MySQL 作为注册中心

```yaml
registry:
  type: jdbc
  heartbeat-refresh-interval: 3s
  session-timeout: 60s
  hikari-config:
    jdbc-url: jdbc:mysql://127.0.0.1:3306/etl
    username: root
    password: root
    maximum-pool-size: 5
    connection-timeout: 9000
    idle-timeout: 600000
```

### 使用 PostgreSQL 作为注册中心

```yaml
registry:
  type: jdbc
  heartbeat-refresh-interval: 3s
  session-timeout: 60s
  hikari-config:
    jdbc-url: jdbc:postgresql://localhost:5432/etl
    username: root
    password: root
    maximum-pool-size: 5
    connection-timeout: 9000
    idle-timeout: 600000
```
