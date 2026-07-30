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

import { computed, defineComponent, PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SettingOutlined } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import { NButton, NIcon, NTooltip } from 'naive-ui'
import styles from './index.module.scss'
import Locales from '../locales'
import Timezone from '../timezone'
import User from '../user'
import Theme from '../theme'

const Navbar = defineComponent({
  name: 'Navbar',
  props: {
    localesOptions: {
      type: Array as PropType<any>,
      default: []
    },
    timezoneOptions: {
      type: Array as PropType<any>,
      default: []
    },
    userDropdownOptions: {
      type: Array as PropType<any>,
      default: []
    }
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()

    const handleUISettingClick = () => {
      router.push({ path: '/ui-setting' })
    }

    const sectionTitle = computed(() => {
      const sectionMap: Record<string, string> = {
        home: 'home',
        projects: 'project',
        resource: 'resources',
        datasource: 'datasource',
        monitor: 'monitor',
        security: 'security'
      }
      const section = sectionMap[String(route.meta.activeMenu)]
      return section ? t(`menu.${section}`) : 'ETL'
    })

    const projectName = computed(() => String(route.query.projectName || ''))
    const pageTitle = computed(() => projectName.value || sectionTitle.value)
    const pageContext = computed(() =>
      projectName.value ? sectionTitle.value : 'ETL PLATFORM'
    )

    return { handleUISettingClick, pageTitle, pageContext, t }
  },
  render() {
    return (
      <div class={styles.container}>
        <div class={styles.identity}>
          <span class={styles.marker} />
          <div>
            <div class={styles.context}>{this.pageContext}</div>
            <div class={styles.title}>{this.pageTitle}</div>
          </div>
        </div>
        <div class={styles.settings}>
          <NTooltip>
            {{
              trigger: () => (
                <NButton
                  circle
                  quaternary
                  aria-label={this.t('menu.ui_setting')}
                  onClick={this.handleUISettingClick}
                >
                  <NIcon size='18'>
                    <SettingOutlined />
                  </NIcon>
                </NButton>
              ),
              default: () => this.t('menu.ui_setting')
            }}
          </NTooltip>
          <Theme />
          <Locales localesOptions={this.localesOptions} />
          <Timezone timezoneOptions={this.timezoneOptions} />
          <span class={styles.divider} />
          <User userDropdownOptions={this.userDropdownOptions} />
        </div>
      </div>
    )
  }
})

export default Navbar
