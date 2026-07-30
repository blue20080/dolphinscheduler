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
  ref,
  inject,
  PropType,
  Ref,
  reactive,
  watch,
  onBeforeUnmount
} from 'vue'
import { useI18n } from 'vue-i18n'
import Styles from './dag.module.scss'
import {
  NTooltip,
  NIcon,
  NButton,
  NSelect,
  NPopover,
  NText,
  NTag
} from 'naive-ui'
import {
  DownloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  InfoCircleOutlined,
  FormatPainterOutlined,
  CopyOutlined,
  DeleteOutlined,
  RightCircleOutlined,
  FundViewOutlined,
  SyncOutlined,
  AppstoreOutlined,
  SaveOutlined,
  CloseOutlined
} from '@vicons/antd'
import { useNodeSearch, useTextCopy } from './dag-hooks'
import { DataUri } from '@antv/x6'
import { useFullscreen } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/store/theme/theme'
import type { Graph } from '@antv/x6'
import StartupParam from './dag-startup-param'
import VariablesView from '@/views/projects/workflow/instance/components/variables-view'
import { WorkflowDefinition, WorkflowInstance } from './types'
import { useDependencies } from '@/views/projects/components/dependencies/use-dependencies'

const props = {
  layoutToggle: {
    type: Function as PropType<(bool?: boolean) => void>,
    default: () => {}
  },
  // If this prop is passed, it means from definition detail
  instance: {
    type: Object as PropType<WorkflowInstance>,
    default: null
  },
  definition: {
    // The same as the structure responsed by the queryWorkflowDefinitionByCode api
    type: Object as PropType<WorkflowDefinition>,
    default: null
  },
  dependenciesData: {
    type: Object as PropType<any>,
    require: false
  },
  readonly: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  libraryVisible: {
    type: Boolean as PropType<boolean>,
    default: true
  }
}

export default defineComponent({
  name: 'workflow-dag-toolbar',
  props,
  emits: [
    'versionToggle',
    'saveModelToggle',
    'removeTasks',
    'refresh',
    'libraryToggle'
  ],
  setup(props, context) {
    const { t } = useI18n()

    const themeStore = useThemeStore()

    const graph = inject<Ref<Graph | undefined>>('graph', ref())
    const router = useRouter()
    const route = useRoute()
    const projectCode = Number(route.params.projectCode)
    const workflowCode = Number(route.params.code)
    const { getDependentTaskLinksByMultipleTasks } = useDependencies()

    const dependenciesData = props.dependenciesData

    /**
     * Node search and navigate
     */
    const { searchSelectValue, navigateTo, reQueryNodes, nodesDropdown } =
      useNodeSearch({ graph })

    /**
     * Download Workflow Image
     * @param {string} fileName
     * @param {string} bgColor
     */
    const downloadPNG = (options = { fileName: 'dag', bgColor: '#f2f3f7' }) => {
      const { fileName, bgColor } = options
      graph.value?.toPNG(
        (dataUri: string) => {
          DataUri.downloadDataUri(dataUri, `${fileName}.png`)
        },
        {
          padding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
          },
          backgroundColor: bgColor
        }
      )
    }

    /**
     * Toggle fullscreen
     */
    const dagRoot = inject<Ref<HTMLElement | undefined>>('dagRoot', ref())
    const { isFullscreen, toggle } = useFullscreen(dagRoot)

    const metrics = reactive({ nodes: 0, edges: 0 })
    const updateMetrics = () => {
      metrics.nodes = graph.value?.getNodes().length || 0
      metrics.edges = graph.value?.getEdges().length || 0
    }
    const graphEvents = [
      'node:added',
      'node:removed',
      'edge:added',
      'edge:removed',
      'reseted'
    ]

    watch(
      graph,
      (current, previous) => {
        graphEvents.forEach((event) => previous?.off(event, updateMetrics))
        graphEvents.forEach((event) => current?.on(event, updateMetrics))
        updateMetrics()
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      graphEvents.forEach((event) => graph.value?.off(event, updateMetrics))
    })

    /**
     * Open workflow version modal
     */
    const openVersionModal = () => {
      context.emit('versionToggle', true)
    }

    /**
     * Open DAG format modal
     */
    const onFormat = () => {
      props.layoutToggle(true)
    }

    /**
     * Back to the entrance
     */
    const onClose = () => {
      const { back, current } = history.state
      if (back && back !== '/login') {
        router.go(-1)
        return
      }
      if (!back || current.includes('workflow/definitions')) {
        router.push({
          path: `/projects/${route.params.projectCode}/workflow-definition`
        })
        return
      }
      if (current.includes('workflow/instances')) {
        router.push({
          path: `/projects/${route.params.projectCode}/workflow/instances`
        })
        return
      }
    }

    /**
     *  Copy workflow name
     */
    const { copy } = useTextCopy()

    /**
     * Delete selected edges and nodes
     */
    const removeCells = async () => {
      if (graph.value) {
        const cells = graph.value.getSelectedCells()
        if (cells) {
          const codes = cells
            .filter((cell) => cell.isNode())
            .map((cell) => +cell.id)
          const res = await getDependentTaskLinksByMultipleTasks(
            projectCode,
            workflowCode,
            codes
          )
          if (res.length > 0) {
            dependenciesData.showRef = true
            dependenciesData.taskLinks = res
            dependenciesData.tip = t(
              'project.task.delete_validate_dependent_tasks_desc'
            )
            dependenciesData.required = true
          } else {
            context.emit('removeTasks', codes, cells)
            graph.value?.removeCells(cells)
          }
        }
      }
    }

    const iconButton = (
      icon: any,
      label: string,
      action: () => void,
      className: any = Styles['toolbar-tool']
    ) => (
      <NTooltip>
        {{
          trigger: () => (
            <NButton
              class={className}
              secondary
              circle
              type='info'
              aria-label={label}
              onClick={action}
            >
              {{ icon: () => <NIcon>{icon}</NIcon> }}
            </NButton>
          ),
          default: () => label
        }}
      </NTooltip>
    )

    return () => {
      const workflowName =
        route.name === 'workflow-instance-detail'
          ? props.instance?.name
          : props.definition?.workflowDefinition?.name ||
            t('project.dag.create')

      return (
        <header class={Styles.toolbar}>
          <div class={Styles['workflow-identity']}>
            {!props.readonly &&
              iconButton(
                <AppstoreOutlined />,
                t('project.dag.task_library'),
                () => context.emit('libraryToggle'),
                [
                  Styles['library-toggle'],
                  props.libraryVisible ? Styles.active : ''
                ]
              )}
            <div class={Styles['workflow-copy']}>
              <span>{t('project.dag.workbench')}</span>
              <strong title={workflowName}>{workflowName}</strong>
            </div>
            <div class={Styles['workflow-meta']}>
              <NTag size='small' type='info'>
                {t('project.dag.node_count', { count: metrics.nodes })}
              </NTag>
              <NTag size='small'>
                {t('project.dag.edge_count', { count: metrics.edges })}
              </NTag>
              {route.name !== 'workflow-instance-detail' &&
                props.definition?.workflowDefinition?.releaseState ===
                  'ONLINE' && (
                  <NTag size='small' type='success'>
                    {t('project.dag.online')}
                  </NTag>
                )}
            </div>
            {props.definition?.workflowDefinition?.name &&
              iconButton(<CopyOutlined />, t('project.dag.copy_name'), () =>
                copy(workflowName)
              )}
            {props.definition?.workflowDefinition?.name && (
              <NTooltip>
                {{
                  trigger: () => (
                    <NPopover
                      placement='bottom'
                      trigger='click'
                      scrollable
                      style={{ maxWidth: '50vw', maxHeight: '70vh' }}
                    >
                      {{
                        trigger: () => (
                          <NButton secondary circle type='info'>
                            {{
                              icon: () => (
                                <NIcon>
                                  <FundViewOutlined />
                                </NIcon>
                              )
                            }}
                          </NButton>
                        ),
                        header: () => (
                          <NText strong depth={1}>
                            {t('project.workflow.parameters_variables')}
                          </NText>
                        ),
                        default: () => <VariablesView onCopy={copy} />
                      }}
                    </NPopover>
                  ),
                  default: () => t('project.dag.view_variables')
                }}
              </NTooltip>
            )}
            {route.name === 'workflow-instance-detail' && (
              <NTooltip>
                {{
                  trigger: () => (
                    <NPopover placement='bottom' trigger='click'>
                      {{
                        trigger: () => (
                          <NButton secondary circle type='info'>
                            {{
                              icon: () => (
                                <NIcon>
                                  <RightCircleOutlined />
                                </NIcon>
                              )
                            }}
                          </NButton>
                        ),
                        header: () => (
                          <NText strong depth={1}>
                            {t('project.workflow.startup_parameter')}
                          </NText>
                        ),
                        default: () => (
                          <StartupParam startupParam={props.instance} />
                        )
                      }}
                    </NPopover>
                  ),
                  default: () => t('project.dag.startup_parameter')
                }}
              </NTooltip>
            )}
          </div>

          <div class={Styles['toolbar-actions']}>
            {metrics.nodes > 0 && (
              <NSelect
                class={Styles['node-selector']}
                size='small'
                value={searchSelectValue.value || null}
                options={nodesDropdown.value}
                placeholder={t('project.dag.search_node')}
                onFocus={reQueryNodes}
                onUpdateValue={navigateTo}
                filterable
                clearable
              />
            )}
            <div class={Styles['toolbar-secondary']}>
              {iconButton(
                <DownloadOutlined />,
                t('project.dag.download_png'),
                () =>
                  downloadPNG({
                    fileName: 'dag',
                    bgColor: themeStore.darkTheme ? '#11171b' : '#f2f5f8'
                  })
              )}
              {props.instance &&
                iconButton(
                  <SyncOutlined />,
                  t('project.dag.refresh_dag_status'),
                  () => context.emit('refresh')
                )}
              {!props.readonly &&
                iconButton(
                  <DeleteOutlined />,
                  t('project.dag.delete_cell'),
                  () => removeCells()
                )}
              {iconButton(
                isFullscreen.value ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                ),
                isFullscreen.value
                  ? t('project.dag.fullscreen_close')
                  : t('project.dag.fullscreen_open'),
                toggle
              )}
              {!props.readonly &&
                iconButton(
                  <FormatPainterOutlined />,
                  t('project.dag.format'),
                  onFormat
                )}
              {!!props.definition &&
                iconButton(
                  <InfoCircleOutlined />,
                  t('project.workflow.version_info'),
                  openVersionModal
                )}
            </div>
            {(!props.readonly || props.instance) && (
              <NButton
                class={[Styles['save-button'], 'btn-save']}
                type='primary'
                size='small'
                aria-label={t('project.dag.save')}
                disabled={
                  props.definition?.workflowDefinition?.releaseState ===
                  'ONLINE' && !props.instance
                }
                onClick={() => context.emit('saveModelToggle', true)}
              >
                {{
                  icon: () => (
                    <NIcon>
                      <SaveOutlined />
                    </NIcon>
                  ),
                  default: () => t('project.dag.save')
                }}
              </NButton>
            )}
            {iconButton(
              <CloseOutlined />,
              t('project.dag.close'),
              onClose,
              'btn-close'
            )}
          </div>
        </header>
      )
    }
  }
})
