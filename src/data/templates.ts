import type { Template } from '../types';

export const templates: Template[] = [
  {
    id: 'dolphin',
    name: '快乐海豚',
    category: '推荐',
    difficulty: 1,
    animalType: 'dolphin',
    estimatedMinutes: 5,
    viewBox: '0 0 320 220',
    regions: [
      { id: 'body', label: '身体', defaultColor: '#e8f7ff', path: 'M70 118 C94 72 178 58 245 86 C275 98 286 118 270 136 C239 171 132 170 75 140 C58 131 58 126 70 118 Z' },
      { id: 'belly', label: '肚皮', defaultColor: '#ffffff', path: 'M110 134 C145 151 218 148 252 128 C232 158 145 166 94 139 Z' },
      { id: 'fin', label: '背鳍', defaultColor: '#d6eff9', path: 'M165 70 C178 36 201 47 201 85 C187 80 176 75 165 70 Z' },
      { id: 'tail', label: '尾巴', defaultColor: '#d6eff9', path: 'M62 120 C33 92 27 71 55 86 C69 94 76 105 80 116 C69 115 63 116 62 120 Z M62 130 C31 142 28 166 55 158 C72 153 80 142 83 132 C73 134 66 134 62 130 Z' },
    ],
  },
  {
    id: 'turtle',
    name: '慢慢海龟',
    category: '简单',
    difficulty: 1,
    animalType: 'turtle',
    estimatedMinutes: 6,
    viewBox: '0 0 320 220',
    regions: [
      { id: 'shell', label: '龟壳', defaultColor: '#edf8e8', path: 'M93 119 C96 72 139 49 188 62 C230 73 253 107 238 145 C224 181 161 190 119 166 C101 156 90 140 93 119 Z' },
      { id: 'shellPatch', label: '龟壳花纹', defaultColor: '#ffffff', path: 'M143 78 L190 82 L216 118 L196 157 L146 161 L117 126 Z' },
      { id: 'head', label: '脑袋', defaultColor: '#d9f2c5', path: 'M235 112 C263 94 289 105 288 130 C287 154 259 160 236 141 Z' },
      { id: 'flippers', label: '鳍足', defaultColor: '#c7eab1', path: 'M103 103 C72 83 48 88 49 110 C50 128 76 132 99 123 Z M104 148 C76 164 54 158 57 137 C59 123 81 123 103 133 Z M209 79 C226 51 250 49 251 70 C252 91 231 95 215 99 Z M210 164 C232 188 257 183 254 162 C252 144 230 142 212 144 Z' },
    ],
  },
  {
    id: 'octopus',
    name: '泡泡章鱼',
    category: '进阶',
    difficulty: 2,
    animalType: 'octopus',
    estimatedMinutes: 8,
    viewBox: '0 0 320 220',
    regions: [
      { id: 'head', label: '脑袋', defaultColor: '#fff0f5', path: 'M112 88 C115 45 151 31 190 47 C224 61 236 103 216 134 C195 166 138 164 119 134 C111 120 108 104 112 88 Z' },
      { id: 'face', label: '脸蛋', defaultColor: '#ffffff', path: 'M137 91 C151 78 185 77 201 93 C211 105 208 126 194 137 C177 150 148 145 136 130 C126 118 126 101 137 91 Z' },
      { id: 'armsA', label: '左触手', defaultColor: '#ffd4e2', path: 'M124 135 C96 142 80 165 92 181 C102 194 123 184 121 165 C120 154 126 147 139 142 Z M154 148 C134 162 132 190 151 197 C170 203 177 181 164 166 C158 159 158 153 165 147 Z' },
      { id: 'armsB', label: '右触手', defaultColor: '#ffc0d6', path: 'M194 143 C210 154 214 184 197 194 C181 203 171 184 184 166 C190 158 190 151 184 146 Z M213 134 C244 139 260 163 247 180 C237 194 216 184 219 165 C221 154 215 147 202 142 Z' },
    ],
  },
  {
    id: 'whale',
    name: '星星鲸鱼',
    category: '推荐',
    difficulty: 2,
    animalType: 'whale',
    estimatedMinutes: 7,
    viewBox: '0 0 320 220',
    regions: [
      { id: 'body', label: '身体', defaultColor: '#eaf2ff', path: 'M64 122 C70 70 128 49 191 59 C247 68 285 103 278 139 C270 181 192 190 122 164 C82 149 60 138 64 122 Z' },
      { id: 'belly', label: '肚皮', defaultColor: '#ffffff', path: 'M103 139 C143 163 221 164 258 133 C244 171 158 180 91 147 Z' },
      { id: 'tail', label: '尾巴', defaultColor: '#d7e7ff', path: 'M66 119 C37 91 28 68 58 82 C76 90 86 106 89 121 C80 119 72 118 66 119 Z M67 129 C35 146 29 170 58 161 C77 155 86 141 90 127 C81 130 73 131 67 129 Z' },
      { id: 'spray', label: '水花', defaultColor: '#bfefff', path: 'M181 58 C173 41 174 28 186 18 C187 35 194 43 205 51 C196 49 189 52 181 58 Z M203 57 C206 38 217 28 232 25 C223 38 221 49 226 62 C217 56 210 55 203 57 Z' },
    ],
  },
];

export const palette = [
  '#ff6b6b',
  '#ff9f43',
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
  '#7b61ff',
  '#ff77b7',
  '#00c2a8',
  '#8bd3ff',
  '#f6f7fb',
  '#7f8c8d',
  '#2d3436',
];

export function getTemplate(templateId: string | undefined) {
  return templates.find((template) => template.id === templateId) ?? templates[0];
}

