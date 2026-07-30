# Standalone 极速体验版

Standalone 仅适用于 ETL 的快速体验。

如果你是新手，想要体验 ETL 的功能，推荐使用 Standalone 方式。如果你想体验更完整的功能或者更大的任务量，推荐使用[伪集群部署](pseudo-cluster.md)。生产环境推荐使用[集群部署](cluster.md)。

> **_注意:_** Standalone 仅建议 20 个以下工作流使用，因为其采用内存式的 H2 Database, Zookeeper Testing Server，任务过多可能导致不稳定，并且如果重启或者停止 standalone-server 会导致内存中数据库里的数据清空。
> Standalone 支持元数据持久化，但是需要使用外部数据库，如 mysql 或者 postgresql，请看[配置数据库](#配置数据库)

## 前置准备工作

- JDK：下载[JDK][jdk] (1.8 or 11)，安装并配置 `JAVA_HOME` 环境变量，并将其下的 `bin` 目录追加到 `PATH` 环境变量中。如果你的环境中已存在，可以跳过这步。
- 二进制包：使用交付的 `etl-*-bin.tar.gz` 安装包。

## 下载插件依赖

请参考伪集群部署的[下载插件依赖](../installation/pseudo-cluster.md#下载插件依赖)，注意 standalone 最小化运行需要下载插件依赖 `dolphinscheduler-task-shell` 和 `dolphinscheduler-storage-hdfs`

## 配置用户免密及权限

创建部署用户，并根据多租户任务的实际需要配置 `sudo` 权限。以创建 `etl` 用户为例：

```shell
# 创建用户需使用 root 登录
useradd -m -s /bin/bash etl

# 添加密码
passwd etl

# 配置 sudo 免密
echo 'etl ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/etl
chmod 440 /etc/sudoers.d/etl
sed -i 's/Defaults    requiretty/#Defaults    requiretty/g' /etc/sudoers

```

> **_注意:_**
>
> - 因为任务执行服务是以 `sudo -u {linux-user} -i` 切换不同 linux 用户的方式来实现多租户运行作业，所以部署用户需要有 sudo 权限，而且是免密的。初学习者不理解的话，完全可以暂时忽略这一点
> - 如果发现 `/etc/sudoers` 文件中有 "Defaults requiretty" 这行，也请注释掉

## 启动 ETL Standalone Server

### 解压并启动 ETL

二进制压缩包中有 standalone 启动的脚本，解压后即可快速启动。

```shell
# 解压并运行 Standalone Server
tar -xvzf etl-*-bin.tar.gz
chown -R etl:etl etl-*-bin
chmod -R 755 etl-*-bin
su - etl
cd /实际安装路径/etl-*-bin
bash ./bin/dolphinscheduler-daemon.sh start standalone-server
```

### 登录 ETL

浏览器访问地址 http://localhost:8080/etl/ui/ 即可登录系统 UI。默认用户名和密码是 **etl/123456**。

![登录页面](../../../../img/new_ui/dev/quick-start/login.png)

## 启停服务

脚本 `./bin/dolphinscheduler-daemon.sh` 除了可以快捷启动 standalone 外，还能停止服务运行，全部命令如下

```shell
# 启动 Standalone Server 服务
bash ./bin/dolphinscheduler-daemon.sh start standalone-server
# 停止 Standalone Server 服务
bash ./bin/dolphinscheduler-daemon.sh stop standalone-server
# 查看 Standalone Server 状态
bash ./bin/dolphinscheduler-daemon.sh status standalone-server
```

> **_注意_**: Python 网关服务默认为关闭状态，如果您想启动 Python 网关服务，
> 请修改 YAML 配置文件，将 `python-gateway.enabled` 设置为 `true`，
> 配置文件路径为 `api-server/conf/application.yaml`

[jdk]: https://www.oracle.com/technetwork/java/javase/downloads/index.html

## 配置数据库

Standalone server 使用 H2 数据库作为其元数据存储数据，这是为了上手简单，用户在启动服务器之前不需要启动数据库。但是如果用户想将元数据库存储在
MySQL 或 PostgreSQL 等其他数据库中，必须更改一些配置。请参考 [数据源配置](datasource-setting.md) `Standalone 切换元数据库` 创建并初始化数据库

> **_注意_**：ETL 当前默认使用内部兼容目录 `/tmp/dolphinscheduler` 作为资源中心。如需修改，请调整 `conf/common.properties` 中的 resource 相关配置。
