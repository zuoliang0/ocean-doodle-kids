# 海洋伙伴 / 儿童海洋涂鸦

这是一个关于“孩子画出来的海洋伙伴，真的游进海里”的小型探索项目。

孩子先选择一个海洋动物模板，用点按分区的方式给它涂色。完成后，作品会被送进一个动态海洋世界里，和其他小鱼、海草、气泡一起慢慢游动。项目面向 3-9 岁儿童，优先考虑 Pad 横屏、触控大按钮、低文字负担和本地离线体验。

这个项目的产品设计与开发探索使用 [cxDesinger](https://github.com/zuoliang0/cxDesinger) 完成。它不是一个商业化产品模板，更像是一次把 AI 辅助产品设计、视觉稿、切片资产和前端实现串起来的实验。

## 设计预览

| 主页 | 模板选择 |
| --- | --- |
| ![主页设计稿](assets/pages/page_page-2/versions/v001.png) | ![模板选择设计稿](assets/pages/page_page-3/versions/v001.png) |

| 涂色编辑器 | 海洋世界 |
| --- | --- |
| ![涂色编辑器设计稿](assets/pages/page_page-3_2/versions/v002.png) | ![海洋世界设计稿](assets/pages/page_page-6/versions/v003.png) |

## 它现在能做什么

- 从主页进入模板选择、我的作品、海洋世界和设置页。
- 选择海洋伙伴模板，进入涂色编辑器。
- 在 SVG 分区上点按填色，使用调色盘、撤销重做和清空确认。
- 自动保存作品草稿，本地保存到浏览器 IndexedDB。
- 完成后进入预览页，把作品送入海洋。
- 在海洋世界中展示已经入海的作品伙伴。
- 在作品库继续编辑或删除本地作品。
- 在设置页管理声音、低性能模式、帮助说明和本地数据。

项目默认不做账号、云同步、社交分享，也不接入第三方追踪。作品只保存在本地浏览器里。

## 为什么做这个

我想验证一个简单但有趣的产品路径：

1. 儿童创作过程足够轻，不需要复杂画笔学习成本。
2. 完成作品后不只是静态保存，而是进入一个“活着”的场景。
3. 视觉稿、切片资产、页面规划和代码实现可以围绕同一份产品事实持续迭代。

所以这个仓库里除了代码，也保留了 PRD、页面规划、技术方案、设计稿和切片资产。它适合拿来观察一个 AI 辅助设计开发项目从想法到可运行 MVP 的过程。

## 技术选型

- Vite + TypeScript
- React + React Router
- Zustand
- IndexedDB + LocalStorage
- PixiJS
- lucide-react

## 本地运行

```bash
npm install
npm run dev
```

然后打开终端里 Vite 输出的本地地址。

## 验证命令

```bash
npm run typecheck
npm run lint
npm run build
```

## 项目结构

```text
.
├── assets/          # 页面设计稿、切片资产、精灵图
├── docs/            # PRD、页面规划、技术方案、功能清单
├── src/
│   ├── components/  # 通用组件
│   ├── data/        # 模板配置
│   ├── lib/         # 存储与作品渲染逻辑
│   ├── pages/       # 页面路由
│   └── store/       # 应用状态
├── pages.json       # 页面、路由、设计稿和资产索引
└── AGENTS.md        # 项目协作规范
```

## 文档

- `docs/prd.md`：产品目标、用户旅程和 MVP 范围。
- `docs/page-plan.md`：页面路由、交互和关键状态。
- `docs/technical-plan.md`：前端架构、数据结构和渲染方案。
- `docs/feature-plan.md`：模块级功能规划。
- `docs/feature-list.md`：可拆票功能清单。
- `pages.json`：页面设计稿、UI prompt 和资产索引。

## 隐私

项目默认不采集个人信息。作品、涂鸦轨迹、导出纹理和设置都保存在用户浏览器本地。清空本地数据会删除已保存作品。

## License

[MIT](./LICENSE)
