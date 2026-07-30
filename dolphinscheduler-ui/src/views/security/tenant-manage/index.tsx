/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import {
  defineComponent,
  toRefs,
  onMounted,
  watch,
  getCurrentInstance
} from 'vue'
import { NButton, NDataTable, NIcon, NPagination } from 'naive-ui'
import { useTable } from './use-table'
import { PlusOutlined } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import TenantModal from './components/tenant-modal'
import Search from '@/components/input-search'
import { DataPanel, FilterBar, Page, PageHeader } from '@/components/workspace'

const tenementManage = defineComponent({
  name: 'tenement-manage',
  setup() {
    const { variables, getTableData, createColumns } = useTable()
    const { t } = useI18n()

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
    const onCancelModal = () => void (variables.showModalRef = false)
    const onConfirmModal = () => {
      variables.showModalRef = false
      requestData()
    }
    const handleChangePageSize = () => {
      variables.page = 1
      requestData()
    }
    const handleSearch = () => {
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
      onCancelModal,
      onConfirmModal,
      handleSearch,
      handleChangePageSize,
      trim
    }
  },
  render() {
    const { t, loadingRef } = this

    return (
      <>
        <Page>
          <PageHeader title={t('menu.tenant_manage')}>
            {{
              actions: () => (
                <NButton
                  size='small'
                  onClick={this.handleModalChange}
                  type='primary'
                  class='btn-create-tenant'
                >
                  {{
                    icon: () => (
                      <NIcon>
                        <PlusOutlined />
                      </NIcon>
                    ),
                    default: () => t('security.tenant.create_tenant')
                  }}
                </NButton>
              )
            }}
          </PageHeader>
          <FilterBar>
            <Search
              v-model:value={this.searchVal}
              placeholder={t('security.tenant.search_tips')}
              onSearch={this.handleSearch}
              onClear={this.handleSearch}
            />
          </FilterBar>
          <DataPanel title={t('menu.tenant_manage')}>
            {{
              default: () => (
                <NDataTable
                  loading={loadingRef}
                  columns={this.columns}
                  data={this.tableData}
                  row-class-name='items'
                  scrollX={this.tableWidth}
                  striped
                  size='small'
                />
              ),
              footer: () => (
                <NPagination
                  v-model:page={this.page}
                  v-model:page-size={this.pageSize}
                  page-count={this.totalPage}
                  show-size-picker
                  page-sizes={[10, 30, 50]}
                  show-quick-jumper
                  onUpdatePage={this.requestData}
                  onUpdatePageSize={this.handleChangePageSize}
                />
              )
            }}
          </DataPanel>
        </Page>
        <TenantModal
          showModalRef={this.showModalRef}
          statusRef={this.statusRef}
          row={this.row}
          onCancelModal={this.onCancelModal}
          onConfirmModal={this.onConfirmModal}
        />
      </>
    )
  }
})

export default tenementManage
