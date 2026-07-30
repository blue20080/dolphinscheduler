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
const light = {
  common: {
    fontFamily:
      "Inter, 'IBM Plex Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    bodyColor: '#f2f5f8',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    textColorBase: '#172b3a',
    textColor1: '#172b3a',
    textColor2: '#405466',
    textColor3: '#6b7d8d',
    borderColor: '#d8e0e8',
    dividerColor: '#e3e9ef',
    borderRadius: '6px',
    borderRadiusSmall: '4px',

    /**************** Brand color */
    primaryColor: '#1f6f9f',
    primaryColorHover: '#2d82b5',
    primaryColorPressed: '#155a82',
    primaryColorSuppl: '#1f6f9f',

    /**************** Function of color */
    infoColor: '#2b7ba7',
    successColor: '#2f855a',
    warningColor: '#c27c0e',
    errorColor: '#c2413a'
  },
  Button: {
    borderRadiusTiny: '4px',
    borderRadiusSmall: '4px',
    borderRadiusMedium: '5px',
    borderRadiusLarge: '5px',
    fontWeight: '600'
  },
  Card: {
    borderRadius: '6px',
    borderColor: '#dce4eb'
  },
  DataTable: {
    thColor: '#edf2f6',
    thColorHover: '#e7eef4',
    tdColorHover: '#f4f7fa',
    borderColor: '#dfe6ed',
    thTextColor: '#31495c'
  },
  Input: {
    borderRadius: '5px',
    border: '1px solid #cbd6df',
    borderHover: '1px solid #7ca6c2',
    borderFocus: '1px solid #1f6f9f',
    boxShadowFocus: '0 0 0 2px rgba(31, 111, 159, 0.14)'
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '5px',
        border: '1px solid #cbd6df',
        borderHover: '1px solid #7ca6c2',
        borderActive: '1px solid #1f6f9f',
        boxShadowActive: '0 0 0 2px rgba(31, 111, 159, 0.14)'
      }
    }
  }
}

export default light
