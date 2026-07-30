# Standalone

Standalone is intended only for a quick ETL evaluation.

If you are new to ETL, we recommend [Standalone deployment](standalone.md).
If you want to experience more complete functions and schedule massive tasks, we recommend you install follow [pseudo-cluster deployment](pseudo-cluster.md).
For production use, follow the [cluster deployment](cluster.md) guide.

> **_Note:_** Standalone only recommends the usage of fewer than 20 workflows, because it uses in-memory H2 Database in default, ZooKeeper Testing Server, too many tasks may cause instability.
> When Standalone stops or restarts, in-memory H2 database will clear up. To use Standalone with external databases like mysql or postgresql, please see [`Database Configuration`](#database-configuration).

## Preparation

- JDK：download [JDK][jdk] (1.8 or 11), install and configure environment variable `JAVA_HOME` and append `bin` dir (included in `JAVA_HOME`) to `PATH` variable. You can skip this step if it already exists in your environment.
- Binary package: use the delivered `etl-*-bin.tar.gz` package.

## Download Plugin Dependencies

Please refer to the [Download Plugin Dependencies](../installation/pseudo-cluster.md) in pseudo-cluster deployment. Note that standalone minimal operation requires downloading plugin dependencies `dolphinscheduler-task-shell` and `dolphinscheduler-storage-hdfs`.

### Configure User Exemption and Permissions

Create an `etl` deployment user and configure `sudo` privileges if multi-tenant tasks require them:

```shell
# To create a user, login as root
useradd -m -s /bin/bash etl

# Add password
passwd etl

# Configure sudo without password
echo 'etl ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/etl
chmod 440 /etc/sudoers.d/etl
sed -i 's/Defaults    requiretty/#Defaults    requiretty/g' /etc/sudoers

```

> **_NOTICE:_**
>
> - ETL switches the Linux user for multi-tenant tasks with `sudo -u {linux-user} -i`, so the deployment user needs password-free `sudo` privileges when this feature is used.
> - If you find the line "Defaults requiretty" in the `/etc/sudoers` file, please comment the content.

## Start ETL Standalone Server

### Extract and Start ETL

There is a standalone startup script in the binary compressed package, which can be quickly started after extraction. Switch to a user with sudo permission and run the script:

```shell
# Extract and start Standalone Server
tar -xvzf etl-*-bin.tar.gz
chown -R etl:etl etl-*-bin
chmod -R 755 etl-*-bin
su - etl
cd /actual/installation/path/etl-*-bin
bash ./bin/dolphinscheduler-daemon.sh start standalone-server
```

### Login to ETL

Access `http://localhost:12345/etl/ui/` to log in to ETL. The default username and password are **admin/dolphinscheduler123**.

![login](../../../../img/new_ui/dev/quick-start/login.png)

### Start or Stop Server

The script `./bin/dolphinscheduler-daemon.sh` can be used not only quickly start standalone, but also to stop the service operation. The following are all the commands:

```shell
# Start Standalone Server
bash ./bin/dolphinscheduler-daemon.sh start standalone-server
# Stop Standalone Server
bash ./bin/dolphinscheduler-daemon.sh stop standalone-server
# Check Standalone Server status
bash ./bin/dolphinscheduler-daemon.sh status standalone-server
```

> Note: Python gateway service is disabled by default. If you want to start the Python gateway
> service please enable it by changing the yaml config `python-gateway.enabled : true` in api-server's configuration
> path `api-server/conf/application.yaml`

[jdk]: https://www.oracle.com/technetwork/java/javase/downloads/index.html

## Database Configuration

Standalone server use H2 database as its metadata store, it is easy and users do not need to start database before they set up server.
But if user want to store metabase in other database like MySQL or PostgreSQL, they have to change some configuration. Follow the instructions in [datasource-setting](datasource-setting.md) `Standalone Switching Metadata Database Configuration` section to create and initialize database

> Note: ETL currently uses the internal compatibility path `/tmp/dolphinscheduler` as the default resource directory. Change the resource settings in `conf/common.properties` when another location is required.
