/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { PlusOutlined } from '@vicons/antd'
import { NButton, NDataTable, NIcon, NPagination } from 'naive-ui'
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  toRefs,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useTable } from './use-table'
import Search from '@/components/input-search'
import { DataPanel, FilterBar, Page, PageHeader } from '@/components/workspace'
import ProjectModal from './components/project-modal'
import WorkerGroupModal from './components/worker-group-modal'
import totalCount from '@/utils/tableTotalCount'

const list = defineComponent({
  name: 'list',
  setup() {
    const { t } = useI18n()
    const { variables, getTableData, createColumns } = useTable()

    const requestData = () => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        searchVal: variables.searchVal
      })
    }

    const handleModalChange = () => {
      variables.showModalRef = true
      variables.statusRef = 0
    }

    const handleSearch = () => {
      variables.page = 1
      requestData()
    }

    const onClearSearch = () => {
      variables.page = 1
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page
      })
    }

    const onCancelModal = () => void (variables.showModalRef = false)
    const onConfirmModal = () => {
      variables.showModalRef = false
      requestData()
    }
    const onCancelWorkerGroupModal = () =>
      void (variables.showWorkerGroupModalRef = false)
    const onConfirmWorkerGroupModal = () => {
      variables.showWorkerGroupModalRef = false
      requestData()
    }
    const handleChangePageSize = () => {
      variables.page = 1
      requestData()
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    onMounted(() => {
      createColumns(variables)
      requestData()
    })

    watch(useI18n().locale, () => createColumns(variables))

    return {
      t,
      ...toRefs(variables),
      requestData,
      handleModalChange,
      handleSearch,
      onCancelModal,
      onConfirmModal,
      onCancelWorkerGroupModal,
      onConfirmWorkerGroupModal,
      onClearSearch,
      handleChangePageSize,
      trim
    }
  },
  render() {
    const { t, loadingRef } = this

    return (
      <>
        <Page>
          <PageHeader title={t('project.list.project_list')}>
            {{
              actions: () => (
                <NButton
                  size='small'
                  onClick={this.handleModalChange}
                  type='primary'
                  class='btn-create-project'
                >
                  {{
                    icon: () => (
                      <NIcon>
                        <PlusOutlined />
                      </NIcon>
                    ),
                    default: () => t('project.list.create_project')
                  }}
                </NButton>
              )
            }}
          </PageHeader>
          <FilterBar>
            <Search
              v-model:value={this.searchVal}
              placeholder={t('project.list.project_tips')}
              onSearch={this.handleSearch}
              onClear={this.onClearSearch}
            />
          </FilterBar>
          <DataPanel
            title={t('project.list.project_list')}
            description={t('project.list.project_count', {
              count: this.totalCount
            })}
          >
            {{
              default: () => (
                <NDataTable
                  loading={loadingRef}
                  columns={this.columns}
                  data={this.tableData}
                  scrollX={this.tableWidth}
                  row-class-name='items'
                  striped
                  size='small'
                />
              ),
              footer: () => (
                <NPagination
                  v-model:page={this.page}
                  v-model:page-size={this.pageSize}
                  show-size-picker
                  page-sizes={[10, 30, 50]}
                  show-quick-jumper
                  onUpdatePage={this.requestData}
                  onUpdatePageSize={this.handleChangePageSize}
                  itemCount={this.totalCount}
                  prefix={totalCount}
                />
              )
            }}
          </DataPanel>
        </Page>
        <ProjectModal
          showModalRef={this.showModalRef}
          statusRef={this.statusRef}
          row={this.row}
          onCancelModal={this.onCancelModal}
          onConfirmModal={this.onConfirmModal}
        />
        <WorkerGroupModal
          showModalRef={this.showWorkerGroupModalRef}
          row={this.row}
          onCancelModal={this.onCancelWorkerGroupModal}
          onConfirmModal={this.onConfirmWorkerGroupModal}
        />
      </>
    )
  }
})

export default list
