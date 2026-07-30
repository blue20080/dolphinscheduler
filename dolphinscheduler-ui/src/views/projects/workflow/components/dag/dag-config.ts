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

export const X6_NODE_NAME = 'dag-task'
export const X6_EDGE_NAME = 'dag-edge'
export const X6_PORT_OUT_NAME = 'dag-port-out'

const EDGE_COLOR = '#8DA2B4'
const BG_BLUE = '#EAF4FA'
const BG_WHITE = '#FFFFFF'
const NODE_BORDER = '#CBD6DF'
const TITLE = '#172B3A'
const STROKE_BLUE = '#1F6F9F'
const NODE_SHADOW = 'drop-shadow(0 6px 10px rgba(16, 42, 67, 0.18))'
const EDGE_SHADOW = 'drop-shadow(0 2px 3px rgba(16, 42, 67, 0.18))'

export const PORT = {
  groups: {
    [X6_PORT_OUT_NAME]: {
      position: {
        name: 'absolute',
        args: {
          x: 224,
          y: 28
        }
      },
      markup: [
        {
          tagName: 'g',
          selector: 'body',
          children: [
            {
              tagName: 'circle',
              selector: 'circle-outer'
            },
            {
              tagName: 'text',
              selector: 'plus-text'
            },
            {
              tagName: 'circle',
              selector: 'circle-inner'
            }
          ]
        }
      ],
      attrs: {
        body: {
          magnet: true
        },
        'plus-text': {
          fontSize: 12,
          fill: NODE_BORDER,
          text: '+',
          textAnchor: 'middle',
          x: 0,
          y: 3
        },
        'circle-outer': {
          stroke: NODE_BORDER,
          strokeWidth: 2,
          r: 6,
          fill: BG_WHITE
        },
        'circle-inner': {
          r: 4,
          fill: 'transparent'
        }
      }
    }
  }
}

export const PORT_HOVER = {
  groups: {
    [X6_PORT_OUT_NAME]: {
      attrs: {
        'circle-outer': {
          stroke: STROKE_BLUE,
          fill: BG_BLUE,
          r: 8
        },
        'circle-inner': {
          fill: STROKE_BLUE,
          r: 6
        }
      }
    }
  }
}

export const PORT_SELECTED = {
  groups: {
    [X6_PORT_OUT_NAME]: {
      attrs: {
        'plus-text': {
          fill: STROKE_BLUE
        },
        'circle-outer': {
          stroke: STROKE_BLUE,
          fill: BG_WHITE
        }
      }
    }
  }
}

export const NODE_STATUS_MARKUP = [
  {
    tagName: 'foreignObject',
    selector: 'fo',
    children: [
      {
        tagName: 'div',
        selector: 'fo-body',
        ns: 'http://www.w3.org/1999/xhtml'
      }
    ],
    style: {
      width: 22,
      height: 22
    }
  }
]

export const NODE = {
  width: 224,
  height: 56,
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
      className: 'dag-task-body'
    },
    {
      tagName: 'rect',
      selector: 'accent'
    },
    {
      tagName: 'image',
      selector: 'image'
    },
    {
      tagName: 'text',
      selector: 'title'
    },
    {
      tagName: 'text',
      selector: 'meta'
    }
  ],
  attrs: {
    body: {
      refWidth: '100%',
      refHeight: '100%',
      rx: 6,
      ry: 6,
      pointerEvents: 'visiblePainted',
      fill: BG_WHITE,
      stroke: NODE_BORDER,
      strokeWidth: 1,
      strokeDasharray: 'none',
      filter: 'none'
    },
    accent: {
      x: 0,
      y: 0,
      width: 4,
      height: 56,
      rx: 3,
      ry: 3,
      fill: STROKE_BLUE
    },
    image: {
      width: 28,
      height: 28,
      refX: 14,
      refY: 14
    },
    title: {
      refX: 52,
      refY: 21,
      fontFamily: "Inter, 'PingFang SC', 'Microsoft YaHei', sans-serif",
      fontSize: 14,
      fontWeight: 600,
      fill: TITLE,
      strokeWidth: 0
    },
    meta: {
      refX: 52,
      refY: 40,
      fontFamily: "Inter, 'PingFang SC', 'Microsoft YaHei', sans-serif",
      fontSize: 10,
      fontWeight: 500,
      fill: '#6B7D8D',
      strokeWidth: 0
    },
    fo: {
      refX: '90%',
      refY: -12
    }
  },
  ports: {
    ...PORT,
    items: [
      {
        id: X6_PORT_OUT_NAME,
        group: X6_PORT_OUT_NAME
      }
    ]
  },
  tools: [
    {
      name: 'contextmenu'
    }
  ]
}

export const NODE_HOVER = {
  attrs: {
    body: {
      fill: BG_BLUE,
      stroke: STROKE_BLUE,
      strokeDasharray: '5,2'
    },
    title: {
      fill: STROKE_BLUE
    },
    meta: {
      fill: STROKE_BLUE
    }
  }
}

export const NODE_SELECTED = {
  attrs: {
    body: {
      filter: NODE_SHADOW,
      fill: BG_WHITE,
      stroke: STROKE_BLUE,
      strokeDasharray: 'none',
      strokeWidth: 2
    },
    title: {
      fill: STROKE_BLUE
    },
    meta: {
      fill: STROKE_BLUE
    }
  }
}

export const EDGE = {
  attrs: {
    line: {
      stroke: EDGE_COLOR,
      strokeWidth: 1.5,
      targetMarker: {
        tagName: 'path',
        fill: EDGE_COLOR,
        strokeWidth: 0,
        d: 'M 7 -5 0 0 7 5 Z'
      },
      filter: 'none'
    }
  },
  connector: {
    name: 'rounded'
  },
  router: {
    name: 'er',
    args: {
      offset: 12
    }
  },
  defaultLabel: {
    markup: [
      {
        tagName: 'rect',
        selector: 'body'
      },
      {
        tagName: 'text',
        selector: 'label'
      }
    ],
    attrs: {
      label: {
        fill: EDGE_COLOR,
        fontSize: 16,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        pointerEvents: 'none'
      },
      body: {
        ref: 'label',
        fill: BG_WHITE,
        stroke: EDGE_COLOR,
        strokeWidth: 2,
        rx: 4,
        ry: 4,
        refWidth: '140%',
        refHeight: '140%',
        refX: '-20%',
        refY: '-20%'
      }
    },
    position: {
      distance: 0.5,
      options: {
        absoluteDistance: true,
        reverseDistance: true
      }
    }
  }
}

export const EDGE_HOVER = {
  attrs: {
    line: {
      stroke: STROKE_BLUE,
      targetMarker: {
        fill: STROKE_BLUE
      }
    }
  },
  defaultLabel: {
    attrs: {
      label: {
        fill: STROKE_BLUE
      },
      body: {
        fill: BG_WHITE,
        stroke: STROKE_BLUE
      }
    }
  }
}

export const EDGE_SELECTED = {
  attrs: {
    line: {
      stroke: STROKE_BLUE,
      targetMarker: {
        fill: STROKE_BLUE
      },
      strokeWidth: 3,
      filter: EDGE_SHADOW
    }
  },
  defaultLabel: {
    attrs: {
      label: {
        fill: STROKE_BLUE
      },
      body: {
        fill: BG_WHITE,
        stroke: STROKE_BLUE
      }
    }
  }
}
