/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.dolphinscheduler.dao.plugin.dameng.monitor;

import org.apache.dolphinscheduler.dao.plugin.api.monitor.DatabaseMetrics;
import org.apache.dolphinscheduler.dao.plugin.api.monitor.DatabaseMonitor;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Date;

import javax.sql.DataSource;

import lombok.SneakyThrows;

import com.baomidou.mybatisplus.annotation.DbType;

public class DamengMonitor implements DatabaseMonitor {

    private final DataSource dataSource;

    public DamengMonitor(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @SneakyThrows
    public DatabaseMetrics getDatabaseMetrics() {
        DatabaseMetrics metrics = new DatabaseMetrics();
        metrics.setDate(new Date());
        metrics.setState(DatabaseMetrics.DatabaseHealthStatus.YES);
        metrics.setDbType(DbType.DM);

        try (
                Connection connection = dataSource.getConnection();
                Statement statement = connection.createStatement()) {
            metrics.setThreadsConnections(queryInt(statement, "select count(*) from v$sessions"));
            metrics.setMaxConnections(queryInt(statement,
                    "select para_value from v$dm_ini where para_name = 'MAX_SESSIONS'"));
            metrics.setThreadsRunningConnections(queryInt(statement,
                    "select count(*) from v$sessions where state = 'ACTIVE'"));
        }
        return metrics;
    }

    private int queryInt(Statement statement, String sql) throws SQLException {
        try (ResultSet resultSet = statement.executeQuery(sql)) {
            return resultSet.next() ? resultSet.getInt(1) : 0;
        }
    }
}
