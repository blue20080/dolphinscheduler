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
    default: 590
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%'
  },
  data: {
    type: Array as PropType<Array<any>>
  }
}

const PieChart = defineComponent({
  name: 'PieChart',
  props,
  setup(props) {
    const pieChartRef: Ref<HTMLDivElement | null> = ref(null)
    const nonZeroData = (props.data || []).filter(
      (item) => Number(item?.value) > 0
    )
    const chartData = nonZeroData.length > 0 ? nonZeroData : props.data

    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: 0,
        left: 'center',
        type: 'scroll',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 14,
        textStyle: {
          fontSize: 11
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '70%'],
          center: ['50%', '43%'],
          avoidLabelOverlap: false,
          padAngle: 2,
          itemStyle: {
            borderColor: 'transparent',
            borderWidth: 2,
            borderRadius: 4
          },
          emphasis: {
            scale: true,
            scaleSize: 5,
            itemStyle: {
              shadowBlur: 14,
              shadowOffsetY: 4,
              shadowColor: 'rgb(19 50 69 / 18%)'
            }
          },
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    }

    initChart(pieChartRef, option)

    return { pieChartRef }
  },
  render() {
    const { height, width } = this
    return (
      <div
        ref='pieChartRef'
        style={{
          height: typeof height === 'number' ? height + 'px' : height,
          width: typeof width === 'number' ? width + 'px' : width
        }}
      />
    )
  }
})

export default PieChart
