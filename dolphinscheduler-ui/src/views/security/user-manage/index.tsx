/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { defineComponent, getCurrentInstance, toRefs } from 'vue'
import { NButton, NDataTable, NIcon, NPagination } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { PlusOutlined } from '@vicons/antd'
import { useColumns } from './use-columns'
import { useTable } from './use-table'
import UserDetailModal from './components/user-detail-modal'
import AuthorizeModal from './components/authorize-modal'
import PasswordModal from './components/password-modal'
import Search from '@/components/input-search'
import { DataPanel, FilterBar, Page, PageHeader } from '@/components/workspace'

const UsersManage = defineComponent({
  name: 'user-manage',
  setup() {
    const { t } = useI18n()
    const { state, changePage, changePageSize, updateList, onOperationClick } =
      useTable()
    const { columnsRef } = useColumns(onOperationClick)

    const onAddUser = () => {
      state.detailModalShow = true
      state.currentRecord = null
    }
    const onDetailModalCancel = () => void (state.detailModalShow = false)
    const onAuthorizeModalCancel = () => void (state.authorizeModalShow = false)
    const onPasswordModalCancel = () => void (state.passwordModalShow = false)

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    return {
      t,
      columnsRef,
      ...toRefs(state),
      changePage,
      changePageSize,
      onAddUser,
      onUpdatedList: updateList,
      onDetailModalCancel,
      onAuthorizeModalCancel,
      onPasswordModalCancel,
      trim
    }
  },
  render() {
    return (
      <>
        <Page>
          <PageHeader title={this.t('menu.user_manage')}>
            {{
              actions: () => (
                <NButton
                  onClick={this.onAddUser}
                  type='primary'
                  class='btn-create-user'
                  size='small'
                >
                  {{
                    icon: () => (
                      <NIcon>
                        <PlusOutlined />
                      </NIcon>
                    ),
                    default: () => this.t('security.user.create_user')
                  }}
                </NButton>
              )
            }}
          </PageHeader>
          <FilterBar>
            <Search
              v-model:value={this.searchVal}
              onSearch={this.onUpdatedList}
              onClear={this.onUpdatedList}
            />
          </FilterBar>
          <DataPanel title={this.t('menu.user_manage')}>
            {{
              default: () => (
                <NDataTable
                  row-class-name='items'
                  columns={this.columnsRef.columns}
                  data={this.list}
                  loading={this.loading}
                  scrollX={this.columnsRef.tableWidth}
                  striped
                  size='small'
                />
              ),
              footer: () => (
                <NPagination
                  v-model:page={this.page}
                  v-model:page-size={this.pageSize}
                  item-count={this.itemCount}
                  show-size-picker
                  page-sizes={[10, 30, 50]}
                  show-quick-jumper
                  on-update:page={this.changePage}
                  on-update:page-size={this.changePageSize}
                />
              )
            }}
          </DataPanel>
        </Page>
        <UserDetailModal
          show={this.detailModalShow}
          currentRecord={this.currentRecord}
          onCancel={this.onDetailModalCancel}
          onUpdate={this.onUpdatedList}
        />
        <AuthorizeModal
          show={this.authorizeModalShow}
          type={this.authorizeType}
          userId={this.currentRecord?.id}
          onCancel={this.onAuthorizeModalCancel}
        />
        <PasswordModal
          show={this.passwordModalShow}
          currentRecord={this.currentRecord}
          onCancel={this.onPasswordModalCancel}
        />
      </>
    )
  }
})

export default UsersManage
