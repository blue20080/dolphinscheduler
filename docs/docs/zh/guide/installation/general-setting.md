# 通用配置

## 语言

ETL 支持 `English` 和 `Chinese` 两种内置语言。您可以点击顶部控制栏中的语言按钮进行切换。
切换后，ETL 的所有页面将使用所选语言。

## 主题

ETL 支持 `Dark` 和 `Light` 两种内置主题。切换主题时，只需单击顶部控制栏中位于 [语言](#语言) 左侧的 `Dark`（或 `Light`）
的按钮即可。

## 时区

ETL 支持时区设置。

服务时区

使用脚本 `bin/dolphinshceduler_daemon.sh`启动服务， 服务的默认时区为UTC， 可以在 `application.yaml` 文件中进行修改，或通过环境变量修改, 如`export SPRING_JACKSON_TIME_ZONE=${SPRING_JACKSON_TIME_ZONE:-Asia/Shanghai}`。<br>
IDEA 启动服务默认时区为本地时区，可以加jvm参数如`-Duser.timezone=UTC`来修改时区。 时区选择详见[List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

用户时区

用户的默认时区基于 ETL 服务运行时区。如果要切换时区，可以点击 [语言](#语言) 按钮右侧的时区按钮，
然后点击 `请选择时区` 进行时区选择。当切换完成后，所有与时间相关的组件都将更改。
