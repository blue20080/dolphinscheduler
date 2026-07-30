/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { defineComponent, onMounted, ref, toRefs, watch } from 'vue'
import { NButton, NDataTable, NIcon, NPagination } from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import { useColumns } from './use-columns'
import { useTable } from './use-table'
import { DefaultTableWidth } from '@/common/column-width-config'
import Search from '@/components/input-search'
import { DataPanel, FilterBar, Page, PageHeader } from '@/components/workspace'
import DetailModal from './detail'
import type { TableColumns } from './types'
import SourceModal from './source-modal'

const list = defineComponent({
  name: 'list',
  setup() {
    const { t } = useI18n()
    const showDetailModal = ref(false)
    const showSourceModal = ref(false)
    const selectType = ref('MYSQL')
    const selectId = ref()
    const columns = ref({
      columns: [] as TableColumns,
      tableWidth: DefaultTableWidth
    })
    const { data, changePage, changePageSize, deleteRecord, updateList } =
      useTable()

    const { getColumns } = useColumns(
      (id: number, type: 'edit' | 'delete', row?: any) => {
        if (type === 'edit') {
          showDetailModal.value = true
          selectId.value = id
          selectType.value = row.type
        } else {
          deleteRecord(id)
        }
      }
    )

    const onCreate = () => {
      selectId.value = null
      showSourceModal.value = true
    }

    const handleSelectSourceType = (value: string) => {
      selectType.value = value
      showSourceModal.value = false
      showDetailModal.value = true
    }

    onMounted(() => {
      changePage(1)
      columns.value = getColumns()
    })

    watch(useI18n().locale, () => void (columns.value = getColumns()))

    return {
      t,
      showDetailModal,
      showSourceModal,
      id: selectId,
      columns,
      ...toRefs(data),
      changePage,
      changePageSize,
      onCreate,
      onUpdatedList: updateList,
      handleSelectSourceType,
      selectType
    }
  },
  render() {
    const { t, columns } = this

    return (
      <>
        <Page>
          <PageHeader title={t('menu.datasource')}>
            {{
              actions: () => (
                <NButton
                  onClick={this.onCreate}
                  type='primary'
                  size='small'
                  class='btn-create-data-source'
                >
                  {{
                    icon: () => (
                      <NIcon>
                        <PlusOutlined />
                      </NIcon>
                    ),
                    default: () => t('datasource.create_datasource')
                  }}
                </NButton>
              )
            }}
          </PageHeader>
          <FilterBar>
            <Search
              v-model:value={this.searchVal}
              placeholder={t('datasource.search_input_tips')}
              onSearch={this.onUpdatedList}
              onClear={this.onUpdatedList}
            />
          </FilterBar>
          <DataPanel
            title={t('menu.datasource')}
            description={t('datasource.datasource_count', {
              count: this.itemCount
            })}
          >
            {{
              default: () => (
                <NDataTable
                  row-class-name='data-source-items'
                  columns={columns.columns}
                  data={this.list}
                  loading={this.loading}
                  striped
                  size='small'
                  scrollX={columns.tableWidth}
                />
              ),
              footer: () => (
                <NPagination
                  page={this.page}
                  page-size={this.pageSize}
                  item-count={this.itemCount}
                  show-quick-jumper
                  show-size-picker
                  page-sizes={[10, 30, 50]}
                  on-update:page={this.changePage}
                  on-update:page-size={this.changePageSize}
                />
              )
            }}
          </DataPanel>
        </Page>
        <SourceModal
          show={this.showSourceModal}
          onChange={this.handleSelectSourceType}
          onMaskClick={() => void (this.showSourceModal = false)}
        />
        <DetailModal
          show={this.showDetailModal}
          id={this.id}
          selectType={this.selectType}
          onCancel={() => void (this.showDetailModal = false)}
          onUpdate={this.onUpdatedList}
          onOpen={() => void (this.showSourceModal = true)}
        />
      </>
    )
  }
})

export default list
