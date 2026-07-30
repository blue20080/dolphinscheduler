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

import { useI18n } from 'vue-i18n'
import { NSelect, NSwitch } from 'naive-ui'
import { defineComponent } from 'vue'
import { useUISettingStore } from '@/store/ui-setting/ui-setting'
import { DataPanel, Page, PageHeader } from '@/components/workspace'
import styles from '@/views/settings.module.scss'

// Update LogTimer store when select value is updated
const handleUpdateValue = (logTimer: number) => {
  const uiSettingStore = useUISettingStore()
  uiSettingStore.setLogTimer(logTimer)
}

const setting = defineComponent({
  name: 'ui-setting',
  setup() {
    const uiSettingStore = useUISettingStore()

    return { uiSettingStore }
  },
  render() {
    const { t } = useI18n()
    const logTimerOptions = [
      { label: t('ui_setting.off'), value: 0 },
      { label: `10 ${t('ui_setting.second')}`, value: 10 },
      { label: `30 ${t('ui_setting.second')}`, value: 30 },
      { label: `1 ${t('ui_setting.minute')}`, value: 60 },
      { label: `5 ${t('ui_setting.minute')}`, value: 300 },
      { label: `30 ${t('ui_setting.minute')}`, value: 1800 }
    ]

    return (
      <Page>
        <PageHeader
          title={t('menu.ui_setting')}
          description={t('ui_setting.description')}
        />
        <DataPanel>
          <div class={styles.settings}>
            <section class={styles['setting-section']}>
              <h2>{t('ui_setting.request_settings')}</h2>
              <div class={styles['setting-row']}>
                <div class={styles['setting-copy']}>
                  <strong>{t('ui_setting.api_timeout')}</strong>
                  <span>{t('ui_setting.api_timeout_description')}</span>
                </div>
                <NSelect
                  class={styles['setting-control']}
                  default-value={this.uiSettingStore.getApiTimer}
                  options={[
                    {
                      label: '10000 ' + t('ui_setting.millisecond'),
                      value: 10000
                    },
                    {
                      label: '20000 ' + t('ui_setting.millisecond'),
                      value: 20000
                    },
                    {
                      label: '30000 ' + t('ui_setting.millisecond'),
                      value: 30000
                    },
                    {
                      label: '40000 ' + t('ui_setting.millisecond'),
                      value: 40000
                    },
                    {
                      label: '50000 ' + t('ui_setting.millisecond'),
                      value: 50000
                    },
                    {
                      label: '60000 ' + t('ui_setting.millisecond'),
                      value: 60000
                    }
                  ]}
                  onUpdateValue={(value) =>
                    this.uiSettingStore.setApiTimer(value)
                  }
                />
              </div>
              <div class={styles['setting-row']}>
                <div class={styles['setting-copy']}>
                  <strong>{t('ui_setting.refresh_time')}</strong>
                  <span>{t('ui_setting.refresh_time_description')}</span>
                </div>
                <NSelect
                  class={styles['setting-control']}
                  default-value={this.uiSettingStore.getLogTimer}
                  options={logTimerOptions}
                  onUpdateValue={handleUpdateValue}
                />
              </div>
            </section>
            <section class={styles['setting-section']}>
              <h2>{t('ui_setting.experimental_feature')}</h2>
              <div class={styles['setting-row']}>
                <div class={styles['setting-copy']}>
                  <strong>{t('ui_setting.dynamic_task_component')}</strong>
                  <span>{t('ui_setting.dynamic_task_description')}</span>
                </div>
                <NSwitch
                  round={false}
                  defaultValue={this.uiSettingStore.getDynamicTask}
                  onUpdateValue={() => this.uiSettingStore.setDynamicTask()}
                />
              </div>
            </section>
          </div>
        </DataPanel>
      </Page>
    )
  }
})

export default setting
