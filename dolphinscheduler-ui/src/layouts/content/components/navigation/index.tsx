/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineComponent, PropType, ref, watch } from 'vue'
import { NLayoutSider, NMenu } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import Logo from '../logo'
import styles from './index.module.scss'

export default defineComponent({
  name: 'PrimaryNavigation',
  props: {
    menuOptions: {
      type: Array as PropType<any[]>,
      default: () => []
    }
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const collapsed = ref(window.innerWidth < 1180)
    const menuKey = ref(route.meta.activeMenu as string)

    const handleMenuClick = (key: string) => {
      router.push({ path: `/${key}` })
    }

    watch(
      () => route.path,
      () => {
        menuKey.value = route.meta.activeMenu as string
      }
    )

    return { collapsed, menuKey, handleMenuClick, router }
  },
  render() {
    return (
      <NLayoutSider
        class={styles.navigation}
        inverted
        bordered={false}
        collapseMode='width'
        collapsed={this.collapsed}
        collapsedWidth={72}
        width={232}
        showTrigger='bar'
        onCollapse={() => (this.collapsed = true)}
        onExpand={() => (this.collapsed = false)}
      >
        <button
          class={styles.brand}
          type='button'
          title='ETL'
          onClick={() => this.router.push('/home')}
        >
          <Logo compact={this.collapsed} />
        </button>
        <div class={styles.divider} />
        <NMenu
          class={styles.menu}
          inverted
          value={this.menuKey}
          options={this.menuOptions}
          collapsed={this.collapsed}
          collapsedWidth={72}
          collapsedIconSize={21}
          onUpdateValue={this.handleMenuClick}
        />
        <div class={[styles.footer, this.collapsed && styles.compact]}>
          <span class={styles.status} />
          {!this.collapsed && <span>ETL PLATFORM</span>}
        </div>
      </NLayoutSider>
    )
  }
})
