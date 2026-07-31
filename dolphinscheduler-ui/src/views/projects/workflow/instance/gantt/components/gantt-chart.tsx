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

import _ from 'lodash'
import { defineComponent, ref, PropType } from 'vue'
import * as echarts from 'echarts'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import initChart from '@/components/chart'
import { chartColors } from '@/components/chart/theme'
import { tasksState } from '@/common/common'
import type { ISeriesData, ITaskState } from '../type'

const ganttStateColors: Partial<Record<ITaskState, string>> = {
  SUBMITTED_SUCCESS: '#748896',
  RUNNING_EXECUTION: chartColors.light.accent,
  PAUSE: chartColors.light.cyan,
  FAILURE: chartColors.light.danger,
  SUCCESS: chartColors.light.success,
  NEED_FAULT_TOLERANCE: chartColors.light.warning,
  KILL: '#923c3c',
  DELAY_EXECUTION: chartColors.light.purple,
  FORCED_SUCCESS: '#497a68',
  DISPATCH: '#365f89'
}

const props = {
  height: {
    type: [String, Number] as PropType<string | number>,
    default: window.innerHeight - 174
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%'
  },
  seriesData: {
    type: Array as PropType<Array<any>>,
    default: () => []
  },
  taskList: {
    type: Array as PropType<Array<string>>,
    default: []
  }
}

const GanttChart = defineComponent({
  name: 'GanttChart',
  props,
  setup(props) {
    const graphChartRef: Ref<HTMLDivElement | null> = ref(null)
    const { t } = useI18n()

    const state = tasksState(t)
    const getStateColor = (key: ITaskState) =>
      ganttStateColors[key] || state[key].color

    const data: ISeriesData = {}
    Object.keys(state).forEach((key) => (data[key] = []))
    const series = Object.keys(state).map((key) => ({
      id: key,
      type: 'custom',
      name: state[key as ITaskState].desc,
      renderItem: renderItem,
      itemStyle: {
        opacity: 0.94,
        color: getStateColor(key as ITaskState),
        color0: getStateColor(key as ITaskState),
        borderRadius: 4
      },
      encode: {
        x: [1, 2],
        y: 0
      },
      data: data[key]
    }))

    // format series data
    let minTime = Number.MAX_VALUE
    let maxTime = 0
    props.seriesData.forEach(function (task, index) {
      const start = Math.floor(task.startDate[0] / 1000) * 1000
      const end = Math.floor(task.endDate[0] / 1000) * 1000
      minTime = minTime < start ? minTime : start
      maxTime = maxTime > end ? maxTime : end
      data[task.status].push({
        name: task.taskName,
        value: [index, start, end, end - start],
        itemStyle: {
          color: getStateColor(task.status as ITaskState)
        }
      })
    })

    // customer render
    function renderItem(params: any, api: any) {
      const taskIndex = api.value(0)
      const start = api.coord([api.value(1), taskIndex])
      const end = api.coord([api.value(2), taskIndex])
      const height = Math.max(10, Math.min(28, api.size([0, 1])[1] * 0.52))
      const rectShape = echarts.graphic.clipRectByRect(
        {
          x: start[0],
          y: start[1] - height / 2,
          width: _.max([end[0] - start[0], 1]) || 1,
          height: height
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height
        }
      )
      return (
        rectShape && {
          type: 'rect',
          transition: ['shape'],
          shape: { ...rectShape, r: 4 },
          style: {
            fill: getStateColor(params.seriesId as ITaskState),
            opacity: 0.94
          }
        }
      )
    }

    const option = {
      title: {
        text: t('project.workflow.task_state'),
        textStyle: {
          fontWeight: 650,
          fontSize: 13
        },
        top: 8,
        left: 20
      },
      tooltip: {
        formatter: function (params: any) {
          const taskName = params.data.name
          const data = props.seriesData.filter(
            (item) => item.taskName === taskName
          )
          let str = `taskName : ${taskName}</br>`
          str += `status : ${state[data[0].status as ITaskState].desc} (${
            data[0].status
          })</br>`
          str += `startTime : ${data[0].isoStart}</br>`
          str += `endTime : ${data[0].isoEnd}</br>`
          str += `duration : ${data[0].duration}</br>`
          return str
        }
      },
      legend: {
        top: 8,
        left: 140,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 14,
        padding: [5, 5, 5, 5],
        textStyle: {
          fontSize: 11
        }
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'weakFilter',
          height: 14,
          bottom: 12,
          start: 0,
          end: 100,
          handleSize: '110%',
          showDetail: false,
          backgroundColor: 'transparent',
          fillerColor: 'rgb(31 111 159 / 18%)',
          borderColor: 'transparent',
          handleStyle: {
            color: chartColors.light.accent,
            borderColor: chartColors.light.accent
          },
          dataBackground: {
            lineStyle: {
              opacity: 0
            },
            areaStyle: {
              opacity: 0
            }
          }
        },
        {
          type: 'inside',
          filterMode: 'weakFilter'
        }
      ],
      grid: {
        top: 72,
        right: 24,
        bottom: 48,
        left: 24,
        containLabel: true
      },
      xAxis: {
        type: 'time',
        min: minTime,
        max: maxTime - minTime > 5000 ? maxTime + 1000 : minTime + 5000,
        position: 'top',
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          formatter: '{HH}:{mm}:{ss}',
          showMinLabel: true,
          showMaxLabel: true,
          hideOverlap: true
        }
      },
      yAxis: {
        axisTick: { show: false },
        splitLine: { show: false },
        axisLine: { show: false },
        data: props.taskList.map((item: string) => {
          return {
            value: item,
            textStyle: {
              width: 130,
              overflow: 'truncate'
            }
          }
        })
      },
      series: series.filter((item) => item.data.length > 0)
    }

    initChart(graphChartRef, option)

    return { graphChartRef }
  },
  render() {
    const { height, width } = this

    return (
      <div
        ref='graphChartRef'
        style={{
          height: typeof height === 'number' ? height + 'px' : height,
          width: typeof width === 'number' ? width + 'px' : width
        }}
      />
    )
  }
})

export default GanttChart
