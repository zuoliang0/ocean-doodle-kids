# 技术方案（Web/H5 Pad 横屏）

## 1. 总体架构
- 纯前端离线优先：无登录、无后端依赖（可选静态资源托管）。
- 三层：
  - UI 与路由层（页面、弹层、引导）
  - 绘画引擎层（2D 分区涂色、画笔涂鸦、透明纹理导出、撤销重做）
  - 世界引擎层（`/ocean` 海洋场景渲染、类 3D 空间表现、实体动画与交互）

## 2. 技术选型建议
- UI 框架：React + TypeScript（或 Vue3 + TS，二选一），路由 React Router/Vue Router。
- 渲染：
  - 涂色编辑器：SVG 分区（DOM/SVG）+ Canvas 合成导出；画笔涂鸦使用 Canvas 图层叠加，保证用户创作阶段保持 2D、直观、低门槛。
  - 海洋世界：PixiJS（WebGL 优先，Canvas fallback）用于 2D 场景、精灵动画、遮罩、位移滤镜与深度排序，实现“类 3D”动态展示；暂不引入 Three.js，避免为当前需求增加真实 3D 模型、相机和贴图展开复杂度。
- 状态管理：轻量 Zustand/Pinia；撤销重做用命令栈。
- 本地存储：IndexedDB（作品、透明纹理、元数据）；LocalStorage（设置项）。
- 资源：模板 SVG、缩略图、海洋背景分层 PNG、前景气泡、光束/水波贴图、音效。

## 3. 分区涂色与 2D 涂鸦实现
- 模板数据模型：
  - `templateId`, `name`, `difficulty`, `animalType`, `regions[]`（每个 region 有 path、默认色、可点击 id）
- 上色：点击 region → 设置 `regionColorMap[regionId] = color`。
- 画笔涂鸦：
  - 每个模板维护独立 doodle canvas 图层，仅限制在动物主体遮罩内绘制。
  - 橡皮擦只作用于 doodle 图层，不破坏分区填色数据。
- 渲染：
  - SVG 每个 region path 绑定 fill；点击命中 region。
  - doodle canvas 覆盖在 SVG 线稿/填色层上，通过模板主体 mask 裁剪。
  - 缩放与拖拽：对 SVG viewBox / transform 和 doodle canvas 使用同一坐标映射，保证触控流畅。
- 撤销/重做：
  - 分区填色记录 regionId 颜色变更（命令：before/after）。
  - 画笔涂鸦按 stroke 记录，不按像素快照记录，控制内存占用。
- 导出纹理：
  - 将分区填色层、画笔涂鸦层、线稿层按配置合成到 offscreen canvas。
  - 导出透明背景 PNG，仅包含海洋动物本体，避免把编辑器背景带入 `/ocean` 场景。
  - 同步生成缩略图 PNG，用于 `/gallery` 和 `/preview/:artworkId`。
  - 元数据保存：`regionColorMap` + `doodleStrokes` + `textureVersion`。

## 4. `/ocean` 海洋世界实现
- 目标：用户创作时保持 2D 涂鸦体验；展示时把作品纹理转化为会游动的海洋动物，通过深度层级、路径、缩放透视和轻量形变形成接近 3D 的空间感。
- 场景分层：
  - 背景层：海水渐变、远景光束、远景鱼影，慢速视差。
  - 中景层：用户入海作品与系统鱼群，是主要互动层。
  - 前景层：气泡、水草或近景遮挡物，速度略快，增强纵深。
  - UI 层：返回、声音、详情卡、空状态入口，独立于场景渲染。
- 实体组件系统（轻量 ECS 思路，避免过度设计）：
  - Entity: id, type (`systemFish`/`userBuddy`)
  - Components: Transform, Sprite, Depth, MotionPath, Flip, Clickable, BubbleEmitter（可选）
- 类 3D 表现策略：
  - 深度值 `depth`：范围 0-1，决定缩放、透明度、模糊、移动速度和渲染排序。
  - 缩放透视：靠前动物更大、移动更快；靠后动物更小、透明度略低。
  - 前后层级：按 `depth` 与 y 坐标排序，动物可从背景游到前景，也可被前景气泡/水草短暂遮挡。
  - 路径游动：每个动物分配贝塞尔/样条路径，路径点带 depth 变化，形成“远近穿梭”的效果。
  - 朝向控制：根据路径切线自动翻转 sprite；转向时使用缓动，避免突变。
  - 轻量形变：对动物纹理使用 PixiJS Mesh/Rope 或顶点偏移做摆尾、摆鳍；低端模式退化为 sprite 旋转和 scale 摆动。
  - 水感滤镜：背景可使用轻量 displacement；用户作品纹理默认不做重滤镜，保留儿童涂鸦清晰度。
- 作品入海流程：
  - `/preview/:artworkId` 点击「入海」后，将 artwork 标记为 `inOcean`。
  - 若作品尚未生成透明纹理，先执行导出；成功后写入 `oceanWorld.buddies`。
  - `/ocean` 启动时从已入海作品池加载纹理，并根据 `pathSeed`、`depthSeed` 生成稳定但不完全重复的运动参数。
- 运动：
  - 系统小鱼：简化群游（速度/转向限制）或预设路径循环。
  - 作品伙伴：使用 2-3 条样条路径随机分配，结合 depth 变化、边界回游和错峰入场，避免相互重叠。
- 交互：
  - 命中测试（Pixi pointer events）→ 选中动物。
  - 选中反馈：动物轻微放大/高亮/冒泡；暂停该实体的路径推进 1-2 秒。
  - 详情卡：显示本机作品信息、创建时间、模板名，并提供「去预览」→ `/preview/:artworkId`。
  - 点击空白处关闭详情卡并恢复游动。
- 空状态：无入海作品时展示轻量引导入口，跳转 `/templates` 或 `/gallery`，不渲染空的复杂场景。
- 性能策略：
  - 低端模式：减少同时游动数量、关闭粒子/位移滤镜、降低背景动画频率。
  - 纹理管理：同一 artwork 纹理只创建一次 Pixi Texture；离开 `/ocean` 时释放未使用纹理。
  - 帧率保护：使用 ticker delta 计算运动，避免设备帧率不同导致速度不一致。

## 5. 数据结构（IndexedDB）
- `artworks`：{ id, templateId, title, status(`draft`/`inOcean`), createdAt, updatedAt, regionColorMap, doodleStrokes, texturePngBlob, thumbnailPngBlob, textureVersion }
- `oceanWorld`：{ buddies: [{ artworkId, spawnAt, pathSeed, depthSeed, scale, speed, preferredLayer }], settingsSeed }
- `settings`（LocalStorage）：soundOn, lowPerfMode, tutorialSeen

## 6. 兼容与交互规范
- 横屏锁定提示：检测竖屏时提示旋转设备（不强制锁定）。
- 触控手势：单指点击、双指缩放（编辑器），避免复杂手势。
- `/ocean` 交互：只保留点击动物查看详情和点击空白关闭，避免拖拽、缩放、旋转等复杂操作干扰展示。
- 可访问性：按钮具备清晰图标与文本（面向家长）。

## 7. 安全与隐私
- 默认不采集个人信息；不接入第三方追踪 SDK。
- 作品、涂鸦轨迹和导出纹理仅保存在本地 IndexedDB。
- 清晰的“本地存储说明”和“清空数据”入口（带家长门禁）。

## 8. 工程化
- 资源与模板配置化：`templates.json` + 资源目录约定。
- 模板需声明 `animalType`、主体遮罩、导出尺寸和默认入海缩放范围，便于 2D 创作结果稳定转为 `/ocean` 动物纹理。
- 构建：Vite；可选 PWA（Service Worker 仅缓存静态资源）。
- 验证重点：
  - 2D 编辑器导出的 PNG 必须透明、边缘干净、主体完整。
  - `/ocean` 中作品动物应有可感知的远近变化、路径游动、朝向切换和轻量摆动。
  - 低端模式下关闭高级效果后仍能展示作品并保持基础游动。
