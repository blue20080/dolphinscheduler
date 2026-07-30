/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { defineComponent, PropType } from 'vue'
import { NEmpty } from 'naive-ui'
import BarChart from '@/components/chart/modules/Bar'

const DefinitionCard = defineComponent({
  name: 'DefinitionCard',
  props: {
    xAxisData: {
      type: Array as PropType<Array<string>>,
      default: () => []
    },
    seriesData: {
      type: Array as PropType<Array<number>>,
      default: () => []
    }
  },
  render() {
    const { xAxisData, seriesData } = this

    return xAxisData.length > 0 && seriesData.length > 0 ? (
      <BarChart xAxisData={xAxisData} seriesData={seriesData} height={300} />
    ) : (
      <NEmpty style={{ padding: '72px 0' }} />
    )
  }
})

export default DefinitionCard
