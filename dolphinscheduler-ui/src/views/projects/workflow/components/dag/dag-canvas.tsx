/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0.
 */

import { defineComponent, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { NButton, NButtonGroup, NIcon, NTag, NTooltip } from 'naive-ui'
import {
  AimOutlined,
  DeploymentUnitOutlined,
  EyeOutlined,
  EditOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import type { Graph } from '@antv/x6'
import Styles from './dag.module.scss'
import { useCanvasInit, useCellActive } from './dag-hooks'

export default defineComponent({
  name: 'workflow-dag-canvas',
  emits: ['drop'],
  setup(_, context) {
    const { t } = useI18n()
    const readonly = inject('readonly', ref(false))
    const graph = inject('graph', ref<Graph>())
    const { paper, minimap, container } = useCanvasInit({ readonly, graph })
    const zoomPercent = ref(100)
    const nodeCount = ref(0)

    useCellActive({ graph })

    const preventDefault = (event: DragEvent) => event.preventDefault()
    const updateNodeCount = () => {
      nodeCount.value = graph.value?.getNodes().length || 0
    }
    const updateZoom = ({ sx }: { sx: number }) => {
      zoomPercent.value = Math.round(sx * 100)
    }
    const zoomIn = () => graph.value?.zoom(0.1)
    const zoomOut = () => graph.value?.zoom(-0.1)
    const fitView = () => {
      if (nodeCount.value > 0) {
        graph.value?.zoomToFit({ padding: 48, maxScale: 1 })
        graph.value?.centerContent()
      } else {
        graph.value?.zoomTo(1)
        graph.value?.centerPoint()
      }
    }

    onMounted(() => {
      graph.value?.on('node:added', updateNodeCount)
      graph.value?.on('node:removed', updateNodeCount)
      graph.value?.on('reseted', updateNodeCount)
      graph.value?.on('scale', updateZoom)
      updateNodeCount()
      zoomPercent.value = Math.round((graph.value?.zoom() || 1) * 100)
    })

    onBeforeUnmount(() => {
      graph.value?.off('node:added', updateNodeCount)
      graph.value?.off('node:removed', updateNodeCount)
      graph.value?.off('reseted', updateNodeCount)
      graph.value?.off('scale', updateZoom)
    })

    const toolButton = (icon: any, label: string, action: () => void) => (
      <NTooltip>
        {{
          trigger: () => (
            <NButton
              quaternary
              size='small'
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

    return () => (
      <section
        ref={container}
        class={[Styles.canvas, 'dag-container']}
        onDrop={(event) => context.emit('drop', event)}
        onDragenter={preventDefault}
        onDragover={preventDefault}
        onDragleave={preventDefault}
      >
        <div ref={paper} class={Styles.paper}></div>
        {nodeCount.value === 0 && (
          <div class={Styles['canvas-empty']}>
            <NIcon size={30}>
              <DeploymentUnitOutlined />
            </NIcon>
            <span>{t('project.dag.empty_workflow')}</span>
          </div>
        )}
        <div class={Styles['canvas-mode']}>
          <NTag size='small' type={readonly.value ? 'default' : 'info'}>
            {{
              icon: () => (
                <NIcon>
                  {readonly.value ? <EyeOutlined /> : <EditOutlined />}
                </NIcon>
              ),
              default: () =>
                readonly.value
                  ? t('project.dag.readonly_mode')
                  : t('project.dag.edit_mode')
            }}
          </NTag>
        </div>
        <div class={Styles['canvas-controls']}>
          <NButtonGroup size='small'>
            {toolButton(
              <ZoomOutOutlined />,
              t('project.dag.zoom_out'),
              zoomOut
            )}
            <NButton quaternary size='small' class={Styles['zoom-value']}>
              {zoomPercent.value}%
            </NButton>
            {toolButton(<ZoomInOutlined />, t('project.dag.zoom_in'), zoomIn)}
            {toolButton(<AimOutlined />, t('project.dag.fit_view'), fitView)}
          </NButtonGroup>
        </div>
        <div ref={minimap} class={Styles.minimap}></div>
      </section>
    )
  }
})
