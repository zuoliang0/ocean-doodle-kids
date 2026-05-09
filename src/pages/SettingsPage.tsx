import { Database, ShieldCheck, SlidersHorizontal, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { AppTopBar } from '../components/AppTopBar';
import { ParentGate } from '../components/ParentGate';
import { useAppStore } from '../store/useAppStore';

const settingsAssets = {
  soundNav: new URL('../../assets/slices/page_page-8/asset_94541af5591c4c05.png', import.meta.url).href,
  dataNav: new URL('../../assets/slices/page_page-8/asset_e2a4da844039498c.png', import.meta.url).href,
  helpNav: new URL('../../assets/slices/page_page-8/asset_6d54a6ff4b3c4868.png', import.meta.url).href,
  privacyNav: new URL('../../assets/slices/page_page-8/asset_5e152e3f572e4b1c.png', import.meta.url).href,
  musicSwitch: new URL('../../assets/slices/page_page-8/asset_dc3819fe15ec49fe.png', import.meta.url).href,
  sfxSwitch: new URL('../../assets/slices/page_page-8/asset_1858b30c6deb4540.png', import.meta.url).href,
  cleanButton: new URL('../../assets/slices/page_page-8/asset_28f0af5470de4a0b.png', import.meta.url).href,
  resetButton: new URL('../../assets/slices/page_page-8/asset_911e2460bc2b4a0d.png', import.meta.url).href,
  privacyCards: [
    new URL('../../assets/slices/page_page-8/asset_7d94e331ee3c49fd.png', import.meta.url).href,
    new URL('../../assets/slices/page_page-8/asset_886a98c22c55418e.png', import.meta.url).href,
    new URL('../../assets/slices/page_page-8/asset_49692741f7454897.png', import.meta.url).href,
  ],
  helpCards: [
    new URL('../../assets/slices/page_page-8/asset_70b32e31228640b7.png', import.meta.url).href,
    new URL('../../assets/slices/page_page-8/asset_e9a00c1b8e784edb.png', import.meta.url).href,
    new URL('../../assets/slices/page_page-8/asset_95502f4241a14fab.png', import.meta.url).href,
    new URL('../../assets/slices/page_page-8/asset_7d2cd8c18bc8410f.png', import.meta.url).href,
  ],
};

export function SettingsPage() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetLocalData = useAppStore((state) => state.resetLocalData);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <section className="page settings-page">
      <AppTopBar title="设置与帮助" />
      <div className="settings-layout">
        <nav className="settings-nav">
          <img className="active" src={settingsAssets.soundNav} alt="声音" />
          <img src={settingsAssets.dataNav} alt="数据" />
          <img src={settingsAssets.helpNav} alt="帮助" />
          <img src={settingsAssets.privacyNav} alt="隐私说明" />
        </nav>
        <section className="settings-content">
          <div className="setting-group">
            <h2><Volume2 size={26} /> 声音</h2>
            <label className="setting-row">
              背景音乐
              <img className="settings-switch-art" src={settingsAssets.musicSwitch} alt="" />
              <input
                type="checkbox"
                checked={settings.soundOn}
                onChange={(event) => updateSettings({ soundOn: event.target.checked })}
              />
            </label>
            <label className="setting-row">
              操作音效
              <img className="settings-switch-art" src={settingsAssets.sfxSwitch} alt="" />
              <input
                type="checkbox"
                checked={settings.sfxOn}
                onChange={(event) => updateSettings({ sfxOn: event.target.checked })}
              />
            </label>
          </div>

          <div className="setting-group">
            <h2><SlidersHorizontal size={26} /> 画面</h2>
            <label className="setting-row">
              低性能模式
              <input
                type="checkbox"
                checked={settings.lowPerfMode}
                onChange={(event) => updateSettings({ lowPerfMode: event.target.checked })}
              />
            </label>
          </div>

          <div className="setting-group">
            <h2><ShieldCheck size={26} /> 隐私</h2>
            <div className="settings-card-strip">
              {settingsAssets.privacyCards.map((path) => <img key={path} src={path} alt="" />)}
            </div>
          </div>

          <div className="setting-group">
            <h2><Database size={26} /> 数据</h2>
            <button className="settings-image-button" type="button">
              <img src={settingsAssets.cleanButton} alt="清理缓存" />
            </button>
            <button className="settings-image-button" type="button" onClick={() => setResetOpen(true)}>
              <img src={settingsAssets.resetButton} alt="重置应用" />
            </button>
          </div>

          <div className="setting-group wide">
            <h2>帮助</h2>
            <div className="settings-card-strip help">
              {settingsAssets.helpCards.map((path) => <img key={path} src={path} alt="" />)}
            </div>
          </div>
        </section>
      </div>
      <ParentGate
        open={resetOpen}
        title="清空本地数据"
        message="这会删除本机作品和海洋世界数据。"
        onCancel={() => setResetOpen(false)}
        onPass={() => {
          void resetLocalData();
          setResetOpen(false);
        }}
      />
    </section>
  );
}
