







import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import MiniChat from './MiniChat'; // 必要に応じてパスを調整

const KPI_LABELS = [
  '売上高', '利益', '損益分岐点', 'CVP分析', 'CCC', '生産性', '健全性'
];
const PERIODS = ['2020', '2021', '2022', '2023', '2024'];
const KPI_DATA = [
  [120, 150, 180, 170, 200],
  [30, 40, 50, 45, 60],
  [100, 110, 120, 115, 125],
  [1.2, 1.3, 1.4, 1.35, 1.5],
  [90, 85, 80, 78, 82],
  [0.8, 0.85, 0.9, 0.95, 1],
  [0.7, 0.75, 0.8, 0.78, 0.82]
];

function FileUpload({onUploaded}:{onUploaded?:(data:any)=>void}) {
  const [file, setFile] = useState<File|null>(null);
  const [type, setType] = useState('bs');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    try {
      const res = await axios.post('/api/upload', formData, {headers: {'Content-Type': 'multipart/form-data'}});
      setMessage('アップロード成功');
      setFile(null);
      if (onUploaded) onUploaded(res.data);
    } catch (e) {
      setMessage('アップロード失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{background:'#f8fafc',padding:20,borderRadius:8,marginBottom:24}}>
      <h3 style={{fontWeight:'bold',marginBottom:8}}>ファイルアップロード</h3>
      <div style={{marginBottom:8}}>
        <label style={{marginRight:8}}>ファイル種別:</label>
        <select value={type} onChange={e=>setType(e.target.value)} style={{border:'1px solid #ccc',borderRadius:4,padding:'2px 8px'}}>
          <option value="bs">貸借対照表（BS）</option>
          <option value="pl">損益計算書（PL）</option>
          <option value="payroll">賃金台帳</option>
          <option value="other">その他</option>
        </select>
      </div>
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} style={{marginBottom:8}} />
      <button onClick={handleUpload} disabled={!file||loading} style={{background:'#3182ce',color:'#fff',border:'none',borderRadius:4,padding:'6px 16px',marginLeft:8}}>
        {loading ? 'アップロード中...' : 'アップロード'}
      </button>
      {message && <div style={{marginTop:8}}>{message}</div>}
    </div>
  );
}

// 定数は関数外で宣言済み
export default function AnalysisPage() {
  // アップロードデータの状態
  const [bsData, setBsData] = useState<any|null>(null);
  const [plData, setPlData] = useState<any|null>(null);

  // ダミーデータ（アップロード前はこれを表示）
  const defaultBs = {
    period: '2024',
    data: {
      '流動資産': 1200,
      '固定資産': 800,
      '流動負債': 900,
      '固定負債': 500,
      '純資産': 600,
    }
  };
  const defaultPl = {
    period: '2024',
    data: {
      '売上高': 5000,
      '売上原価': 3000,
      '販売費及び一般管理費': 1200,
      '営業利益': 800,
      '経常利益': 700,
      '当期純利益': 500,
    }
  };

  // アップロード有無に応じて表示データを切替
  const bs = bsData || defaultBs;
  const pl = plData || defaultPl;

  // グラフ用データ例（売上高・営業利益の5期分ダミー）
  const chartData = {
    labels: PERIODS,
    datasets: KPI_LABELS.map((label, idx) => ({
      label,
      data: KPI_DATA[idx],
      borderColor: idx === 0 ? '#3182ce' : '#38b2ac',
      backgroundColor: idx === 0 ? 'rgba(49,130,206,0.2)' : 'rgba(56,178,172,0.2)',
      tension: 0.3,
    }))
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '売上高・営業利益 5期推移' }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7fa', paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>決算書アップロード＆決算分析ダッシュボード</h1>
        <div style={{display:'flex',gap:24,marginBottom:24}}>
          <div style={{flex:1}}>
            <FileUpload onUploaded={data => {
              if(data.type==='bs') setBsData(data);
              if(data.type==='pl') setPlData(data);
            }} />
          </div>
        </div>
        <div style={{ margin: '32px 0', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>決算分析一覧表（{bs.period}年度）</h2>
          <div style={{display:'flex',gap:48}}>
            <div>
              <h3 style={{fontWeight:'bold',marginBottom:8}}>貸借対照表（BS）</h3>
              <table style={{ borderCollapse: 'collapse', minWidth: 260 }}>
                <tbody>
                  {Object.entries(bs.data).map(([k,v]) => (
                    <tr key={k}>
                      <td style={{ border: '1px solid #eee', padding: '8px 12px', fontWeight: 'bold', background: '#f6f8fa' }}>{k}</td>
                      <td style={{ border: '1px solid #eee', padding: '8px 12px', textAlign: 'right' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 style={{fontWeight:'bold',marginBottom:8}}>損益計算書（PL）</h3>
              <table style={{ borderCollapse: 'collapse', minWidth: 260 }}>
                <tbody>
                  {Object.entries(pl.data).map(([k,v]) => (
                    <tr key={k}>
                      <td style={{ border: '1px solid #eee', padding: '8px 12px', fontWeight: 'bold', background: '#f6f8fa' }}>{k}</td>
                      <td style={{ border: '1px solid #eee', padding: '8px 12px', textAlign: 'right' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div style={{ margin: '32px 0', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>売上高・営業利益グラフ（5期推移）</h2>
          <Line data={chartData} options={options} />
        </div>
      </div>
      <MiniChat />
    </div>
  );
}
