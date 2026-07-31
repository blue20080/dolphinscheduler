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

export const chartColors = {
  light: {
    accent: '#1f6f9f',
    cyan: '#2ea7b8',
    success: '#2f855a',
    warning: '#c27c0e',
    danger: '#c2413a',
    purple: '#7068a8',
    text: '#405466',
    muted: '#6b7d8d',
    border: '#cbd6df',
    grid: '#e3e9ee',
    gaugeTrack: '#dfe8ee',
    tooltipBackground: '#ffffff'
  },
  dark: {
    accent: '#55b7d1',
    cyan: '#62c6a3',
    success: '#6bc49a',
    warning: '#e7bf68',
    danger: '#e07878',
    purple: '#a890d5',
    text: '#dce7ed',
    muted: '#99abb8',
    border: '#3a4a54',
    grid: '#2a3943',
    gaugeTrack: '#2b3b45',
    tooltipBackground: '#1b262d'
  }
}

const baseTheme = (colors: typeof chartColors.light) => ({
  color: [
    colors.accent,
    colors.cyan,
    colors.success,
    colors.warning,
    colors.danger,
    colors.purple
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: colors.text,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  title: {
    textStyle: {
      color: colors.text,
      fontWeight: 650
    }
  },
  legend: {
    textStyle: {
      color: colors.muted
    },
    pageTextStyle: {
      color: colors.muted
    }
  },
  tooltip: {
    backgroundColor: colors.tooltipBackground,
    borderColor: colors.border,
    borderWidth: 1,
    padding: [8, 10],
    textStyle: {
      color: colors.text,
      fontSize: 12
    },
    extraCssText: 'box-shadow: 0 8px 24px rgb(19 50 69 / 14%);'
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: colors.border
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: colors.muted,
      fontSize: 11
    },
    splitLine: {
      show: false
    }
  },
  valueAxis: {
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: colors.muted,
      fontSize: 11
    },
    splitLine: {
      lineStyle: {
        color: colors.grid,
        type: 'dashed'
      }
    }
  },
  timeAxis: {
    axisLine: {
      lineStyle: {
        color: colors.border
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: colors.muted,
      fontSize: 11
    },
    splitLine: {
      lineStyle: {
        color: colors.grid,
        type: 'dashed'
      }
    }
  }
})

export const chartThemes = {
  light: baseTheme(chartColors.light),
  dark: baseTheme(chartColors.dark)
}
