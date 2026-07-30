# General Setting

## Language

ETL supports two built-in languages: `English` and `Chinese`. Click the language button
on the top control bar named `English` and `Chinese` and change it to another one when you want to switch the language.
All ETL pages will use the selected language.

## Theme

ETL supports two built-in themes: `Dark` and `Light`. To change the ETL theme,
click the button named `Dark` (or `Light`) on the top control bar and on the left
of to [language](#language) control button.

## Time Zone

ETL supports time zone settings.

Server Time Zone

The default time zone is UTC when using `bin/dolphinshceduler_daemon.sh` to start the server, you could update `SPRING_JACKSON_TIME_ZONE` in `bin/env/dolphinscheduler_env.sh`, such as `export SPRING_JACKSON_TIME_ZONE=${SPRING_JACKSON_TIME_ZONE:-Asia/Shanghai}`.<br>
If you start server in IDEA, the default time zone is your local time zone, you could add the JVM parameter to update server time zone, such as `-Duser.timezone=UTC`. Time zone list refer to [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

User Time zone

The user's default time zone is based on the ETL service time zone. You can
click the button on the right of the [language](#language) button and then click `Choose timeZone` to choose the time zone
you want to switch. All time related components will adjust their time zone according to the time zone setting you select.
