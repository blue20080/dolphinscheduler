/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { defineComponent, PropType, renderSlot } from 'vue'
import { NIcon, NSpin } from 'naive-ui'
import styles from './index.module.scss'

const Page = defineComponent({
  name: 'EtlPage',
  setup(_, { slots }) {
    return () => <main class={styles.page}>{renderSlot(slots, 'default')}</main>
  }
})

const PageHeader = defineComponent({
  name: 'EtlPageHeader',
  props: {
    title: {
      type: String as PropType<string>,
      required: true
    },
    description: String as PropType<string>
  },
  setup(props, { slots }) {
    return () => (
      <header class={styles['page-header']}>
        <div class={styles['page-heading']}>
          <h1>{props.title}</h1>
          {props.description && <p>{props.description}</p>}
        </div>
        {slots.actions && (
          <div class={styles['page-actions']}>
            {renderSlot(slots, 'actions')}
          </div>
        )}
      </header>
    )
  }
})

const FilterBar = defineComponent({
  name: 'EtlFilterBar',
  setup(_, { slots }) {
    return () => (
      <section class={styles['filter-bar']}>
        <div class={styles['filter-fields']}>
          {renderSlot(slots, 'default')}
        </div>
        {slots.extra && (
          <div class={styles['filter-extra']}>{renderSlot(slots, 'extra')}</div>
        )}
      </section>
    )
  }
})

const DataPanel = defineComponent({
  name: 'EtlDataPanel',
  props: {
    title: String as PropType<string>,
    description: String as PropType<string>,
    loading: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  setup(props, { slots }) {
    return () => (
      <section class={styles['data-panel']}>
        {(props.title || props.description || slots.extra) && (
          <header class={styles['panel-header']}>
            <div class={styles['panel-heading']}>
              {props.title && <h2>{props.title}</h2>}
              {props.description && <p>{props.description}</p>}
            </div>
            {slots.extra && (
              <div class={styles['panel-extra']}>
                {renderSlot(slots, 'extra')}
              </div>
            )}
          </header>
        )}
        <NSpin show={props.loading}>
          <div class={styles['panel-content']}>
            {renderSlot(slots, 'default')}
          </div>
        </NSpin>
        {slots.footer && (
          <footer class={styles['panel-footer']}>
            {renderSlot(slots, 'footer')}
          </footer>
        )}
      </section>
    )
  }
})

const StatCard = defineComponent({
  name: 'EtlStatCard',
  props: {
    label: {
      type: String as PropType<string>,
      required: true
    },
    value: {
      type: [String, Number] as PropType<string | number>,
      default: 0
    },
    tone: {
      type: String as PropType<
        'primary' | 'success' | 'warning' | 'danger' | 'neutral'
      >,
      default: 'primary'
    }
  },
  setup(props, { slots }) {
    return () => (
      <article class={[styles['stat-card'], styles[`tone-${props.tone}`]]}>
        <div class={styles['stat-copy']}>
          <span>{props.label}</span>
          <strong>{props.value}</strong>
        </div>
        {slots.icon && (
          <div class={styles['stat-icon']}>
            <NIcon size={22}>{renderSlot(slots, 'icon')}</NIcon>
          </div>
        )}
      </article>
    )
  }
})

export { Page, PageHeader, FilterBar, DataPanel, StatCard }
