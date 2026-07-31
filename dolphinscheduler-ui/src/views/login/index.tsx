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

import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  toRefs,
  withKeys
} from 'vue'
import styles from './index.module.scss'
import {
  NInput,
  NButton,
  NForm,
  NFormItem,
  useMessage,
  NSpace,
  NDivider,
  NImage,
  NIcon,
  NDropdown
} from 'naive-ui'
import { useForm } from './use-form'
import { useTranslate } from './use-translate'
import { useLogin } from './use-login'
import { useLocalesStore } from '@/store/locales/locales'
import { useThemeStore } from '@/store/theme/theme'
import cookies from 'js-cookie'
import { ssoLoginUrl } from '@/service/modules/login'
import type {
  OAuth2Provider,
  OidcProvider
} from '@/service/modules/login/types'
import type { Locales } from '@/store/locales/types'
import {
  DatabaseOutlined,
  DeploymentUnitOutlined,
  GlobalOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from '@vicons/antd'
import logoDark from '@/assets/images/logo-dark.svg'
import logoLight from '@/assets/images/logo-light.svg'

const login = defineComponent({
  name: 'login',
  setup() {
    window.$message = useMessage()
    const { state, t, locale } = useForm()
    const { handleChange } = useTranslate(locale)
    const {
      handleLogin,
      handleGetOAuth2Provider,
      handleGetOidcProviders,
      oauth2Providers,
      oidcProviders,
      gotoOAuth2Page,
      handleRedirect
    } = useLogin(state)
    const localesStore = useLocalesStore()
    const themeStore = useThemeStore()

    themeStore.setLightTheme()

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    const languageOptions = [
      { label: '中文', key: 'zh_CN' },
      { label: 'English', key: 'en_US' }
    ]
    const handleLanguageSelect = (key: string) => {
      handleChange(key as Locales)
    }

    cookies.set('language', localesStore.getLocales, { path: '/' })

    onMounted(async () => {
      const ssoLoginUrlRes = await ssoLoginUrl()
      state.loginForm.ssoLoginUrl = ssoLoginUrlRes
      if (state.loginForm.ssoLoginUrl) {
        const url = new URL(window.location.href)
        const ssoState = url.searchParams.get('state')
        const ssoCode = url.searchParams.get('code')
        if (ssoState && ssoCode) {
          state.loginForm.userName = ssoState
          state.loginForm.userPassword = ssoCode
          handleLogin()
        }
      } else {
        state.loginForm.ssoLoginUrl = ''
      }
      handleRedirect()
    })

    handleGetOAuth2Provider()
    handleGetOidcProviders()
    return {
      t,
      handleChange,
      handleLogin,
      ...toRefs(state),
      localesStore,
      trim,
      oauth2Providers,
      oidcProviders,
      gotoOAuth2Page,
      languageOptions,
      handleLanguageSelect,
      logoDark,
      logoLight
    }
  },
  render() {
    return (
      <div class={styles.container}>
        <section class={styles['brand-panel']}>
          <div class={styles['brand-header']}>
            <img src={this.logoLight} alt='ETL' />
          </div>
          <div class={styles['brand-content']}>
            <div class={styles['brand-kicker']}>ETL CONTROL PLANE</div>
            <div class={styles['brand-title']}>Data operations, in focus.</div>
            <div class={styles['pipeline-visual']} aria-hidden='true'>
              <div class={styles['pipeline-track']} />
              <div class={[styles['pipeline-node'], styles['node-source']]}>
                <NIcon size='30'>
                  <DatabaseOutlined />
                </NIcon>
                <span class={styles['node-bars']}>
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div class={[styles['pipeline-node'], styles['node-flow']]}>
                <NIcon size='30'>
                  <DeploymentUnitOutlined />
                </NIcon>
                <span class={styles['node-bars']}>
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div class={[styles['pipeline-node'], styles['node-trust']]}>
                <NIcon size='30'>
                  <SafetyCertificateOutlined />
                </NIcon>
                <span class={styles['node-bars']}>
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
            <div class={styles['brand-readout']}>
              <span>
                <i /> DATA FABRIC ONLINE
              </span>
              <strong>99.98% SIGNAL</strong>
            </div>
          </div>
          <div class={styles['brand-footer']}>ETL PLATFORM</div>
        </section>

        <main class={styles['auth-panel']}>
          <div class={styles['language-switch']}>
            <NDropdown
              trigger='click'
              options={this.languageOptions}
              onSelect={this.handleLanguageSelect}
            >
              <NButton quaternary class={styles['language-button']}>
                <NIcon size='17'>
                  <GlobalOutlined />
                </NIcon>
                <span>
                  {this.localesStore.getLocales === 'zh_CN'
                    ? '中文'
                    : 'English'}
                </span>
              </NButton>
            </NDropdown>
          </div>

          <div class={styles['login-model']}>
            <img class={styles['mobile-logo']} src={this.logoLight} alt='ETL' />
            <div class={styles['form-heading']}>
              <div class={styles['form-eyebrow']}>ETL WORKSPACE</div>
              <h1>{this.t('login.welcome')}</h1>
            </div>
            <div
              class={styles['form-model']}
              v-show={this.loginForm.ssoLoginUrl.length === 0}
            >
              <NForm
                rules={this.rules}
                ref='loginFormRef'
                labelPlacement='top'
                showRequireMark={false}
              >
                <NFormItem label={this.t('login.userName')} path='userName'>
                  <NInput
                    allowInput={this.trim}
                    class='input-user-name'
                    type='text'
                    size='large'
                    v-model={[this.loginForm.userName, 'value']}
                    placeholder={this.t('login.userName_tips')}
                    autofocus
                    onKeydown={withKeys(this.handleLogin, ['enter'])}
                  >
                    {{
                      prefix: () => (
                        <NIcon size='18'>
                          <UserOutlined />
                        </NIcon>
                      )
                    }}
                  </NInput>
                </NFormItem>
                <NFormItem
                  label={this.t('login.userPassword')}
                  path='userPassword'
                >
                  <NInput
                    allowInput={this.trim}
                    class='input-password'
                    type='password'
                    size='large'
                    v-model={[this.loginForm.userPassword, 'value']}
                    placeholder={this.t('login.userPassword_tips')}
                    showPasswordOn='click'
                    onKeydown={withKeys(this.handleLogin, ['enter'])}
                  >
                    {{
                      prefix: () => (
                        <NIcon size='18'>
                          <LockOutlined />
                        </NIcon>
                      )
                    }}
                  </NInput>
                </NFormItem>
              </NForm>
              <NButton
                class='btn-login'
                type='primary'
                size='large'
                disabled={
                  !this.loginForm.userName || !this.loginForm.userPassword
                }
                style={{ width: '100%' }}
                onClick={this.handleLogin}
              >
                {this.t('login.login')}
              </NButton>
            </div>
            <div
              class={styles['form-model']}
              v-show={this.loginForm.ssoLoginUrl.length !== 0}
            >
              <a href={this.loginForm.ssoLoginUrl} class={styles['sso-link']}>
                <NButton
                  class='btn-login-sso'
                  type='primary'
                  size='large'
                  style={{ width: '100%' }}
                  onClick={this.handleLogin}
                >
                  {this.t('login.ssoLogin')}
                </NButton>
              </a>
            </div>
            {(this.oauth2Providers.length > 0 ||
              this.oidcProviders.length > 0) && (
              <NDivider>{this.t('login.loginWithOAuth2')}</NDivider>
            )}

            <NSpace class={styles['oauth2-provider']} justify='center'>
              {this.oauth2Providers?.map((e: OAuth2Provider) => {
                return e.iconUri ? (
                  <div onClick={() => this.gotoOAuth2Page(e)}>
                    <NImage
                      preview-disabled
                      width='30'
                      src={e.iconUri}
                    ></NImage>{' '}
                  </div>
                ) : (
                  <NButton onClick={() => this.gotoOAuth2Page(e)}>
                    {e.provider}
                  </NButton>
                )
              })}
              {this.oidcProviders?.map((e: OidcProvider) => {
                const authUrl = `/etl/oauth2/authorization/${e.id}`
                return (
                  <a href={authUrl} class={styles['oidc-provider-link']}>
                    <NButton block class={styles['oidc-provider-btn']}>
                      <div class={styles['oidc-btn-content']}>
                        {e.iconUri && (
                          <img
                            src={e.iconUri}
                            class={styles['oidc-btn-icon']}
                          />
                        )}
                        <span>{e.displayName}</span>
                      </div>
                    </NButton>
                  </a>
                )
              })}
            </NSpace>
          </div>
          <div class={styles['auth-footer']}>ETL · ENTERPRISE EDITION</div>
        </main>
      </div>
    )
  }
})

export default login
