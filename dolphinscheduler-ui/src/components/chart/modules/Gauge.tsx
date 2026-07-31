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

import { defineComponent, PropType, reactive, ref, watch } from 'vue'
import initChart from '@/components/chart'
import type { Ref } from 'vue'
import { useThemeStore } from '@/store/theme/theme'
import { chartColors } from '../theme'

const props = {
  height: {
    type: [String, Number] as PropType<string | number>,
    default: 260
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%'
  },
  data: {
    type: [String, Number] as PropType<string | number>
  }
}

const GaugeChart = defineComponent({
  name: 'GaugeChart',
  props,
  setup(props) {
    const gaugeChartRef: Ref<HTMLDivElement | null> = ref(null)
    const themeStore = useThemeStore()
    const value = Math.min(100, Math.max(0, Number(props.data) || 0))

    const getColors = () =>
      themeStore.darkTheme ? chartColors.dark : chartColors.light

    const option = reactive({
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          splitNumber: 4,
          radius: '78%',
          center: ['50%', '56%'],
          axisLine: {
            lineStyle: {
              width: 20,
              roundCap: true,
              color: [[1, getColors().gaugeTrack]]
            }
          },
          progress: {
            show: true,
            roundCap: true,
            width: 20,
            itemStyle: {
              color: getColors().accent
            }
          },
          pointer: {
            show: false
          },
          anchor: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            offsetCenter: [0, '8%'],
            color: getColors().accent,
            fontSize: 23,
            fontWeight: 700
          },
          data: [
            {
              value
            }
          ]
        }
      ]
    })

    const updateTheme = () => {
      const colors = getColors()
      const series = option.series[0]
      series.axisLine.lineStyle.color = [[1, colors.gaugeTrack]]
      series.progress.itemStyle.color = colors.accent
      series.detail.color = colors.accent
    }

    watch(() => themeStore.darkTheme, updateTheme)

    const resize = (chart: any) => {
      const clientWidth = gaugeChartRef.value?.clientWidth || 400
      chart &&
        chart.setOption({
          series: [
            {
              detail: {
                fontSize: Math.max(18, Math.min(24, clientWidth / 14))
              }
            }
          ]
        })
      chart && chart.resize()
    }

    initChart(gaugeChartRef, option, resize)

    return { gaugeChartRef }
  },
  render() {
    const { height, width } = this
    return (
      <div
        ref='gaugeChartRef'
        style={{
          height: typeof height === 'number' ? height + 'px' : height,
          width: typeof width === 'number' ? width + 'px' : width
        }}
      />
    )
  }
})

export default GaugeChart
