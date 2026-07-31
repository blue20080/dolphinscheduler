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

import { defineComponent, PropType, ref } from 'vue'
import initChart from '@/components/chart'
import type { Ref } from 'vue'

const props = {
  height: {
    type: [String, Number] as PropType<string | number>,
    default: 400
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%'
  },
  xAxisData: {
    type: Array as PropType<Array<string>>,
    default: () => []
  },
  seriesData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  }
}

const BarChart = defineComponent({
  name: 'BarChart',
  props,
  setup(props) {
    const barChartRef: Ref<HTMLDivElement | null> = ref(null)

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      grid: {
        top: 20,
        left: 18,
        right: 18,
        bottom: 30,
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: props.xAxisData,
          axisLabel: {
            hideOverlap: true,
            interval: 'auto'
          },
          axisTick: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          type: 'bar',
          barMaxWidth: 28,
          barCategoryGap: '42%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            focus: 'series'
          },
          label: {
            show: true,
            position: 'top',
            color: 'inherit',
            fontSize: 11
          },
          data: props.seriesData
        }
      ]
    }

    initChart(barChartRef, option)

    return { barChartRef }
  },
  render() {
    const { height, width } = this
    return (
      <div
        ref='barChartRef'
        style={{
          height: typeof height === 'number' ? height + 'px' : height,
          width: typeof width === 'number' ? width + 'px' : width
        }}
      />
    )
  }
})

export default BarChart
