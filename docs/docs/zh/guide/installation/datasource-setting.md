# 数据源配置

## Standalone 切换元数据库

我们这里以 MySQL 为例来说明如何配置外部数据库：

> 如果使用 MySQL，需要手动下载 [mysql-connector-java 驱动][mysql] (8.0.16) 并移动到 ETL 各模块的 libs 目录，包括 `api-server/libs`、`alert-server/libs`、`master-server/libs` 和 `worker-server/libs`。

* 首先，参照 `伪分布式/分布式安装初始化数据库` 创建并初始化数据库
* 在你的命令行设定下列环境变量，将 `{address}`, `{user}` 和 `{password}` 改为你数据库的地址, 用户名和密码

```shell
export DATABASE=mysql
export SPRING_PROFILES_ACTIVE=${DATABASE}
export SPRING_DATASOURCE_URL="jdbc:mysql://{address}/etl?useUnicode=true&characterEncoding=UTF-8&useSSL=false"
export SPRING_DATASOURCE_USERNAME={user}
export SPRING_DATASOURCE_PASSWORD={password}
```

* 将mysql-connector-java驱动加到`./standalone-server/libs/standalone-server/`目录下, 下载方法见 [数据源配置](datasource-setting.md) `伪分布式/分布式安装初始化数据库` 一栏
* 启动standalone-server，此时你已经连接上mysql，重启或者停止standalone-server并不会清空您数据库里的数据

## 伪分布式/分布式安装初始化数据库

ETL 元数据存储在关系型数据库中，目前支持 PostgreSQL 和 MySQL。下面分别介绍如何使用 MySQL 和 PostgreSQL 初始化数据库。

> 如果使用 MySQL，需要手动下载 [mysql-connector-java 驱动][mysql] (8.0.16) 并移动到 ETL 各模块的 libs 目录，包括 `api-server/libs`、`alert-server/libs`、`master-server/libs`、`worker-server/libs` 和 `tools/libs`。

对于mysql 5.6 / 5.7：

```shell
mysql -uroot -p

mysql> CREATE DATABASE etl DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;

# 修改 {user} 和 {password} 为你希望的用户名和密码
mysql> GRANT ALL PRIVILEGES ON etl.* TO '{user}'@'%' IDENTIFIED BY '{password}';
mysql> GRANT ALL PRIVILEGES ON etl.* TO '{user}'@'localhost' IDENTIFIED BY '{password}';

mysql> flush privileges;
```

对于mysql 8：

```shell
mysql -uroot -p

mysql> CREATE DATABASE etl DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;

# 修改 {user} 和 {password} 为你希望的用户名和密码
mysql> CREATE USER '{user}'@'%' IDENTIFIED BY '{password}';
mysql> GRANT ALL PRIVILEGES ON etl.* TO '{user}'@'%';
mysql> CREATE USER '{user}'@'localhost' IDENTIFIED BY '{password}';
mysql> GRANT ALL PRIVILEGES ON etl.* TO '{user}'@'localhost';
mysql> FLUSH PRIVILEGES;
```

对于 PostgreSQL：

```shell
# 采用命令行工具登陆 PostgreSQL
psql
# 创建数据库
postgres=# CREATE DATABASE etl;
# 修改 {user} 和 {password} 为你希望的用户名和密码
postgres=# CREATE USER {user} PASSWORD {password};
postgres=# ALTER DATABASE etl OWNER TO {user};
# 退出 PostgreSQL
postgres=#\q
# 在终端执行如下命令，向配置文件新增登陆权限，并重载 PostgreSQL 配置，替换 {ip} 为对应的 DS 集群服务器 IP 地址段
echo "host    etl   {user}    {ip}     md5" >> $PGDATA/pg_hba.conf
pg_ctl reload
```

然后设置以下环境变量，将username和password改成你在上一步中设置的用户名{user}和密码{password}

> **⚠️ 时区配置提醒**
>
> 避免使用 `CST` 等模糊时区标识符，可能造成调度时间错误。
>
> 推荐使用明确的时区，如：`serverTimezone=Asia/Shanghai`

对于 MySQL：

```shell
# for mysql
export DATABASE=${DATABASE:-mysql}
export SPRING_PROFILES_ACTIVE=${DATABASE}
export SPRING_DATASOURCE_URL="jdbc:mysql://127.0.0.1:3306/etl?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone={your_timezone}"
export SPRING_DATASOURCE_USERNAME={user}
export SPRING_DATASOURCE_PASSWORD={password}
```

对于 PostgreSQL：

```shell
# for postgresql
export DATABASE=${DATABASE:-postgresql}
export SPRING_PROFILES_ACTIVE=${DATABASE}
export SPRING_DATASOURCE_URL="jdbc:postgresql://127.0.0.1:5432/etl"
export SPRING_DATASOURCE_USERNAME={user}
export SPRING_DATASOURCE_PASSWORD={password}
```

完成上述步骤后，已经为 ETL 创建好数据库，可以通过 Shell 脚本初始化表结构：

```shell
bash tools/bin/upgrade-schema.sh
```

## 数据源中心

数据源中心支持MySQL、POSTGRESQL、HIVE/IMPALA、SPARK、CLICKHOUSE、ORACLE、SQLSERVER等数据源。

- 点击"数据源中心->创建数据源"，根据需求创建不同类型的数据源
- 点击"测试连接"，测试数据源是否可以连接成功（只有当数据源通过连接性测试后才能保存数据源）。

### 使用不兼容 Apache License 2.0 许可的数据库

数据源中心里，ETL 对部分数据源有原生支持，但部分数据源需要用户下载对应的 JDBC 驱动包并放置到正确位置才能正常使用。
这对用户会增加用户的使用成本，但是我们不得不这么做，因为这部分数据源的 JDBC 驱动和 Apache LICENSE V2 不兼容，所以我们无法在
ETL 二进制包中包含这些驱动。这部分数据源主要包括 MySQL、Oracle、SQL Server 等，可按下述方式补充驱动。

#### 样例

我们以 MySQL 为例，如果你想要使用 MySQL 数据源，你需要先在 [mysql maven 仓库](https://repo1.maven.org/maven2/mysql/mysql-connector-java)
中下载对应版本的 JDBC 驱动，将其移入 `api-server/libs` 以及 `worker-server/libs` 文件夹中，最后重启 `api-server` 和 `worker-server`
服务，即可使用 MySQL 数据源。

> 注意：如果你只是想要在数据源中心使用 MySQL，则对 MySQL JDBC 驱动的版本没有要求；如果你想要将 MySQL 作为 ETL 的元数据库，
> 则仅支持 [8.0.16 及以上](https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.16/mysql-connector-java-8.0.16.jar)的版本。

[mysql]: https://downloads.MySQL.com/archives/c-j/
