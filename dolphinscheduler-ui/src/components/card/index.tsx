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

import { CSSProperties, defineComponent, PropType } from 'vue'
import { NCard } from 'naive-ui'
import styles from './index.module.scss'

const headerStyle = {
  minHeight: '54px',
  padding: '11px 16px',
  borderBottom: '1px solid var(--etl-border)'
}

const contentStyle = {
  padding: '14px 16px'
}

const filterContentStyle = {
  padding: '10px 14px'
}

const headerExtraStyle = {}

const props = {
  title: {
    type: String as PropType<string>
  },
  headerStyle: {
    type: String as PropType<string | CSSProperties>
  },
  headerExtraStyle: {
    type: String as PropType<string | CSSProperties>
  },
  contentStyle: {
    type: String as PropType<string | CSSProperties>
  }
}

const Card = defineComponent({
  name: 'Card',
  props,
  render() {
    const { title, $slots } = this
    return (
      <NCard
        class={[styles.card, title ? styles.panel : styles.filter]}
        title={title}
        size='small'
        headerStyle={this.headerStyle ? this.headerStyle : headerStyle}
        headerExtraStyle={
          this.headerExtraStyle ? this.headerExtraStyle : headerExtraStyle
        }
        contentStyle={
          this.contentStyle
            ? this.contentStyle
            : title
            ? contentStyle
            : filterContentStyle
        }
      >
        {$slots}
      </NCard>
    )
  }
})

export default Card
