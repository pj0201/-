import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
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
      // 仮APIエンドポイント
      await axios.post('/api/upload', formData, {headers: {'Content-Type': 'multipart/form-data'}});
      setMessage('アップロード成功');
    } catch (e) {
      setMessage('アップロード失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-xl font-bold mb-4">ファイルアップロード</h2>
      <div className="mb-4">
        <label className="mr-2">ファイル種別:</label>
        <select value={type} onChange={e=>setType(e.target.value)} className="border rounded px-2 py-1">
          <option value="bs">貸借対照表（BS）</option>
          <option value="pl">損益計算書（PL）</option>
          <option value="payroll">賃金台帳</option>
          <option value="other">その他</option>
        </select>
      </div>
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="mb-4" />
      <button onClick={handleUpload} disabled={!file||loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
        {loading ? 'アップロード中...' : 'アップロード'}
      </button>
      {message && <div className="mt-2">{message}</div>}
    </div>
  );
}
