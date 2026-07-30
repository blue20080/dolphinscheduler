/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { defineComponent, onMounted, ref, toRefs, watch } from 'vue'
import { NDatePicker, NGrid, NGi } from 'naive-ui'
import { startOfToday, getTime } from 'date-fns'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeploymentUnitOutlined,
  ProjectOutlined,
  SyncOutlined
} from '@vicons/antd'
import { useTaskState } from './use-task-state'
import { useWorkflowState } from './use-workflow-state'
import { useWorkflowDefinition } from './use-workflow-definition'
import StateCard from '@/views/home/components/state-card'
import DefinitionCard from '@/views/home/components/definition-card'
import {
  DataPanel,
  FilterBar,
  Page,
  PageHeader,
  StatCard
} from '@/components/workspace'

const workflowMonitor = defineComponent({
  name: 'workflow-monitor',
  setup() {
    const { t, locale } = useI18n()
    const route = useRoute()
    const dateRef = ref<[number, number]>([getTime(startOfToday()), Date.now()])
    const taskStateRef = ref()
    const workflowStateRef = ref()
    const { getTaskState, taskVariables } = useTaskState()
    const { getWorkflowState, workflowVariables } = useWorkflowState()
    const { getWorkflowDefinition } = useWorkflowDefinition()
    const workflowDefinitionRef = getWorkflowDefinition()

    const initData = () => {
      taskStateRef.value = getTaskState(dateRef.value) || taskStateRef.value
      workflowStateRef.value =
        getWorkflowState(dateRef.value) || workflowStateRef.value
    }

    const handleDate = (val: [number, number]) => {
      dateRef.value = val
      taskStateRef.value = getTaskState(val) || taskStateRef.value
      workflowStateRef.value = getWorkflowState(val) || workflowStateRef.value
    }

    onMounted(initData)

    watch(() => locale.value, initData)

    return {
      t,
      projectName: route.query.projectName,
      dateRef,
      handleDate,
      taskStateRef,
      workflowStateRef,
      workflowDefinitionRef,
      ...toRefs(taskVariables),
      ...toRefs(workflowVariables)
    }
  },
  render() {
    const { t, dateRef, handleDate, taskLoadingRef, workflowLoadingRef } = this
    const taskTable = this.taskStateRef?.value?.table || []
    const workflowTable = this.workflowStateRef?.value?.table || []
    const getCount = (data: Array<any>, state: string) =>
      data.find((item) => item.state === state)?.number || 0
    const taskTotal = taskTable.reduce(
      (total: number, item: any) => total + item.number,
      0
    )
    const definitionTotal = (
      this.workflowDefinitionRef?.seriesData || []
    ).reduce((total: number, item: number) => total + item, 0)

    return (
      <Page>
        <PageHeader
          title={String(this.projectName || t('menu.project_overview'))}
          description={t('home.project_overview_description')}
        />
        <FilterBar>
          <NDatePicker
            value={dateRef}
            onUpdateValue={handleDate}
            size='small'
            type='datetimerange'
            clearable={false}
          />
        </FilterBar>
        <NGrid x-gap={12} y-gap={12} cols='1 500:2 900:3 1240:5'>
          <NGi>
            <StatCard label={t('home.total_tasks')} value={taskTotal}>
              {{ icon: () => <ProjectOutlined /> }}
            </StatCard>
          </NGi>
          <NGi>
            <StatCard
              label={t('home.successful_tasks')}
              value={getCount(taskTable, t('home.success'))}
              tone='success'
            >
              {{ icon: () => <CheckCircleOutlined /> }}
            </StatCard>
          </NGi>
          <NGi>
            <StatCard
              label={t('home.failed_tasks')}
              value={getCount(taskTable, t('home.failure'))}
              tone='danger'
            >
              {{ icon: () => <CloseCircleOutlined /> }}
            </StatCard>
          </NGi>
          <NGi>
            <StatCard
              label={t('home.running_tasks')}
              value={getCount(taskTable, t('home.running_execution'))}
              tone='warning'
            >
              {{ icon: () => <SyncOutlined /> }}
            </StatCard>
          </NGi>
          <NGi>
            <StatCard
              label={t('home.workflow_definitions')}
              value={definitionTotal}
              tone='neutral'
            >
              {{ icon: () => <DeploymentUnitOutlined /> }}
            </StatCard>
          </NGi>
        </NGrid>
        <NGrid x-gap={12} y-gap={12} cols='1 1080:2'>
          <NGi>
            <StateCard
              title={t('home.task_state_statistics')}
              tableData={taskTable}
              chartData={this.taskStateRef?.value?.chart}
              loadingRef={taskLoadingRef}
            />
          </NGi>
          <NGi>
            <StateCard
              title={t('home.workflow_state_statistics')}
              tableData={workflowTable}
              chartData={this.workflowStateRef?.value?.chart}
              loadingRef={workflowLoadingRef}
            />
          </NGi>
        </NGrid>
        <DataPanel title={t('home.workflow_definition_statistics')}>
          <DefinitionCard
            xAxisData={this.workflowDefinitionRef?.xAxisData}
            seriesData={this.workflowDefinitionRef?.seriesData}
          />
        </DataPanel>
      </Page>
    )
  }
})

export default workflowMonitor
