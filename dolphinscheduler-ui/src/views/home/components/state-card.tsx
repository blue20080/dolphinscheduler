/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { defineComponent, PropType } from 'vue'
import { NDataTable, NEmpty, NGrid, NGi } from 'naive-ui'
import { useTable } from '../use-table'
import PieChart from '@/components/chart/modules/Pie'
import { DataPanel } from '@/components/workspace'
import type { StateTableData, StateChartData } from '../types'

const StateCard = defineComponent({
  name: 'StateCard',
  props: {
    title: String as PropType<string>,
    tableData: {
      type: Array as PropType<Array<StateTableData>>,
      default: () => []
    },
    chartData: {
      type: Array as PropType<Array<StateChartData>>,
      default: () => []
    },
    loadingRef: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  render() {
    const { title, tableData, chartData, loadingRef } = this
    const { columnsRef } = useTable()
    const hasChartData = chartData.some((item) => item.value > 0)

    return (
      <DataPanel title={title} loading={loadingRef}>
        {chartData.length > 0 || tableData.length > 0 ? (
          <NGrid x-gap={12} y-gap={12} cols='1 620:2'>
            <NGi>
              {hasChartData ? (
                <PieChart data={chartData} height={280} />
              ) : (
                <NEmpty style={{ padding: '96px 0' }} />
              )}
            </NGi>
            <NGi>
              {tableData.length > 0 && (
                <NDataTable
                  columns={columnsRef}
                  data={tableData}
                  striped
                  size='small'
                  maxHeight={280}
                />
              )}
            </NGi>
          </NGrid>
        ) : (
          <NEmpty style={{ padding: '72px 0' }} />
        )}
      </DataPanel>
    )
  }
})

export default StateCard
