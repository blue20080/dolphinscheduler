/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { computed, defineComponent, onMounted, reactive } from 'vue'
import {
  NButton,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NIcon,
  NInput,
  NSpin,
  NTag,
  NTooltip
} from 'naive-ui'
import { SearchOutlined, StarFilled, StarOutlined } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import styles from './dag.module.scss'
import type { TaskType } from './types'
import {
  CancelCollection,
  Collection,
  getDagMenu
} from '@/service/modules/dag-menu'

type DagTask = {
  taskType: string
  taskCategory: string
  collection: boolean
  starHover: boolean
  type: string
}

const categoryDefinitions = [
  { key: 'universal', value: 'Universal', label: 'project.menu.universal' },
  { key: 'cloud', value: 'Cloud', label: 'project.menu.cloud' },
  { key: 'logic', value: 'Logic', label: 'project.menu.logic' },
  { key: 'di', value: 'DataIntegration', label: 'project.menu.di' },
  { key: 'dq', value: 'DataQuality', label: 'project.menu.dq' },
  { key: 'ml', value: 'MachineLearning', label: 'project.menu.ml' },
  { key: 'other', value: 'Other', label: 'project.menu.other' }
]

export default defineComponent({
  name: 'workflow-dag-sidebar',
  emits: ['dragStart'],
  setup(_, context) {
    const { t } = useI18n()
    const state = reactive({
      dataList: [] as DagTask[],
      search: '',
      loading: false
    })

    const loadTasks = async () => {
      state.loading = true
      try {
        const response = await getDagMenu()
        state.dataList = response.map((item: any) => ({
          ...item,
          starHover: false,
          type: item.taskType
        }))
      } finally {
        state.loading = false
      }
    }

    const favoriteTasks = computed(() =>
      state.dataList.filter((item) => item.collection)
    )

    const searchTasks = computed(() => {
      const keyword = state.search.trim().toLocaleLowerCase()
      if (!keyword) return []
      return state.dataList.filter((item) =>
        item.taskType.toLocaleLowerCase().includes(keyword)
      )
    })

    const categories = computed(() => {
      const groups = categoryDefinitions.map((category) => ({
        ...category,
        tasks: state.dataList.filter(
          (item) => item.taskCategory === category.value
        )
      }))
      if (favoriteTasks.value.length > 0) {
        groups.unshift({
          key: 'fav',
          value: 'Favorite',
          label: 'project.menu.fav',
          tasks: favoriteTasks.value
        })
      }
      return groups.filter((group) => group.tasks.length > 0)
    })

    const toggleCollection = async (task: DagTask) => {
      task.collection = !task.collection
      try {
        if (task.collection) {
          await Collection(task.taskType)
        } else {
          await CancelCollection(task.taskType)
        }
        await loadTasks()
      } catch (error) {
        task.collection = !task.collection
        throw error
      }
    }

    const renderTask = (task: DagTask, showCategory = false) => (
      <div
        class={[styles.draggable, `task-item-${task.type}`]}
        draggable='true'
        onDragstart={(event) =>
          context.emit('dragStart', event, task.type as TaskType)
        }
      >
        <div class={styles['task-icon-wrap']}>
          <em
            class={[
              styles['sidebar-icon'],
              styles[`icon-${task.type.toLocaleLowerCase()}`]
            ]}
          />
        </div>
        <div class={styles['task-copy']}>
          <strong>{task.taskType}</strong>
          {showCategory && (
            <span>
              {t(
                categoryDefinitions.find(
                  (category) => category.value === task.taskCategory
                )?.label || 'project.menu.other'
              )}
            </span>
          )}
        </div>
        <NTooltip>
          {{
            trigger: () => (
              <NButton
                text
                focusable={false}
                class={styles.stars}
                aria-label={t('project.dag.favorite')}
                onMousedown={(event: MouseEvent) => event.stopPropagation()}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation()
                  toggleCollection(task)
                }}
                onMouseenter={() => void (task.starHover = true)}
                onMouseleave={() => void (task.starHover = false)}
              >
                <NIcon
                  size={17}
                  color={
                    task.collection || task.starHover
                      ? 'var(--etl-amber-500)'
                      : 'var(--etl-text-secondary)'
                  }
                >
                  {task.collection ? <StarFilled /> : <StarOutlined />}
                </NIcon>
              </NButton>
            ),
            default: () => t('project.dag.favorite')
          }}
        </NTooltip>
      </div>
    )

    onMounted(loadTasks)

    return () => (
      <aside class={styles.sidebar}>
        <div class={styles['library-header']}>
          <div>
            <span>{t('project.dag.component_library')}</span>
            <strong>{t('project.dag.task_library')}</strong>
          </div>
          <NTag size='small' type='info'>
            {state.dataList.length}
          </NTag>
        </div>
        <NInput
          class={styles['library-search']}
          size='small'
          clearable
          value={state.search}
          placeholder={t('project.dag.search_component')}
          onUpdateValue={(value) => void (state.search = value)}
        >
          {{
            prefix: () => (
              <NIcon size={15}>
                <SearchOutlined />
              </NIcon>
            )
          }}
        </NInput>
        <NSpin show={state.loading}>
          <div class={styles['library-content']}>
            {state.search ? (
              searchTasks.value.length > 0 ? (
                <div class={styles['search-results']}>
                  {searchTasks.value.map((task) => renderTask(task, true))}
                </div>
              ) : (
                <NEmpty size='small' />
              )
            ) : (
              <NCollapse
                defaultExpandedNames={['fav', 'universal']}
                arrowPlacement='right'
              >
                {categories.value.map((category) => (
                  <NCollapseItem
                    title={`${t(category.label)} · ${category.tasks.length}`}
                    name={category.key}
                    class={`task-cate-${category.key}`}
                  >
                    {category.tasks.map((task) => renderTask(task))}
                  </NCollapseItem>
                ))}
              </NCollapse>
            )}
          </div>
        </NSpin>
      </aside>
    )
  }
})
