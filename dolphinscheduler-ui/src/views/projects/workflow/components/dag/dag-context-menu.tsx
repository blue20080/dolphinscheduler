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

import { genTaskCodeList } from '@/service/modules/task-definition'
import type { Cell } from '@antv/x6'
import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  PropType,
  inject,
  ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import styles from './menu.module.scss'
import { uuid } from '@/common/common'
import { IWorkflowTaskInstance } from './types'
import { NButton, NIcon } from 'naive-ui'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined
} from '@vicons/antd'
import { useDependencies } from '@/views/projects/components/dependencies/use-dependencies'

const props = {
  startDisplay: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  executeTaskDisplay: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  menuDisplay: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  taskInstance: {
    type: Object as PropType<IWorkflowTaskInstance>,
    require: true
  },
  cell: {
    type: Object as PropType<Cell>,
    require: true
  },
  visible: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  left: {
    type: Number as PropType<number>,
    default: 0
  },
  top: {
    type: Number as PropType<number>,
    default: 0
  },
  dependenciesData: {
    type: Object as PropType<any>,
    require: false
  }
}

export default defineComponent({
  name: 'dag-context-menu',
  props,
  emits: [
    'hide',
    'start',
    'edit',
    'viewLog',
    'copyTask',
    'removeTasks',
    'executeTask',
    'removeTaskInstanceCache'
  ],
  setup(props, ctx) {
    const graph = inject('graph', ref())
    const route = useRoute()
    const projectCode = Number(route.params.projectCode)
    const workflowCode = Number(route.params.code)
    const { t } = useI18n()

    const { getDependentTaskLinksByTask } = useDependencies()

    const dependenciesData = props.dependenciesData

    const hide = () => {
      ctx.emit('hide', false)
    }

    const startRunning = () => {
      ctx.emit('start', Number(props.cell?.id))
    }

    const handleEdit = () => {
      ctx.emit('edit', Number(props.cell?.id))
    }

    const handleViewLog = () => {
      if (props.taskInstance) {
        ctx.emit('viewLog', props.taskInstance.id, props.taskInstance.taskType)
      }
    }

    const handleExecuteTaskOnly = () => {
      ctx.emit('executeTask', Number(props.cell?.id), 'TASK_ONLY')
    }

    const handleExecuteTaskPOST = () => {
      if (props.taskInstance) {
        ctx.emit('executeTask', Number(props.cell?.id), 'TASK_POST')
      }
    }

    const handleExecuteTaskPRE = () => {
      if (props.taskInstance) {
        ctx.emit('executeTask', Number(props.cell?.id), 'TASK_PRE')
      }
    }

    const handleCopy = () => {
      const genNums = 1
      const type = props.cell?.data.taskType
      const taskName = uuid(props.cell?.data.taskName + '_')
      const targetCode = Number(props.cell?.id)
      const flag = props.cell?.data.flag

      genTaskCodeList(genNums, projectCode).then((res) => {
        const [code] = res
        ctx.emit('copyTask', taskName, code, targetCode, type, flag, {
          x: props.left + 100,
          y: props.top + 100
        })
      })
    }

    const handleDelete = async () => {
      const taskCode = props.cell?.id
      const res = await getDependentTaskLinksByTask(
        projectCode,
        workflowCode,
        taskCode
      )
      dependenciesData.showRef = false
      if (res.length > 0) {
        dependenciesData.showRef = true
        dependenciesData.taskLinks = res
        dependenciesData.tip = t(
          'project.task.delete_validate_dependent_tasks_desc'
        )
        dependenciesData.required = true
      } else {
        graph.value?.removeCell(props.cell)
        ctx.emit('removeTasks', [Number(props.cell?.id)])
      }
    }

    const handleDocumentClick = () => hide()

    onMounted(() => document.addEventListener('click', handleDocumentClick))
    onBeforeUnmount(() =>
      document.removeEventListener('click', handleDocumentClick)
    )

    return {
      startRunning,
      handleEdit,
      handleCopy,
      handleDelete,
      handleViewLog,
      handleExecuteTaskOnly,
      handleExecuteTaskPOST,
      handleExecuteTaskPRE
    }
  },
  render() {
    const { t } = useI18n()
    const menuButton = (
      icon: any,
      label: string,
      action: () => void,
      danger = false
    ) => (
      <NButton
        quaternary
        class={[styles['menu-item'], danger ? styles.danger : '']}
        onClick={action}
      >
        {{
          icon: () => <NIcon>{icon}</NIcon>,
          default: () => label
        }}
      </NButton>
    )

    return (
      this.visible && (
        <div
          class={styles['dag-context-menu']}
          style={{ left: `${this.left}px`, top: `${this.top}px` }}
        >
          {this.startDisplay &&
            menuButton(
              <PlayCircleOutlined />,
              t('project.node.start'),
              this.startRunning
            )}
          {this.menuDisplay && (
            <>
              {menuButton(
                <EditOutlined />,
                t('project.node.edit'),
                this.handleEdit
              )}
              {menuButton(
                <CopyOutlined />,
                t('project.node.copy'),
                this.handleCopy
              )}
              {menuButton(
                <DeleteOutlined />,
                t('project.node.delete'),
                this.handleDelete,
                true
              )}
            </>
          )}
          {this.taskInstance && (
            <>
              {menuButton(
                <FileSearchOutlined />,
                t('project.node.view_log'),
                this.handleViewLog
              )}
            </>
          )}
          {this.executeTaskDisplay && (
            <>
              {menuButton(
                <ThunderboltOutlined />,
                t('project.workflow.current_node_execution_task'),
                this.handleExecuteTaskOnly
              )}
              {menuButton(
                <ArrowDownOutlined />,
                t('project.workflow.backward_execution_task'),
                this.handleExecuteTaskPOST
              )}
              {menuButton(
                <ArrowUpOutlined />,
                t('project.workflow.forward_execution_task'),
                this.handleExecuteTaskPRE
              )}
            </>
          )}
        </div>
      )
    )
  }
})
