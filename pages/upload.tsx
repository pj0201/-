import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Layout from '../components/layout/Layout';

export default function Upload() {
  const [file, setFile] = useState<File|null>(null);
  const [type, setType] = useState('bs');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [companyName, setCompanyName] = useState('株式会社サンプル企業');
  const [period, setPeriod] = useState('2024');

  const handleUpload = async () => {
    if (!file) return;
    
    // ファイル形式チェック
    const allowedTypes = ['.xlsx', '.xls', '.pdf', '.png', '.jpg', '.jpeg', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExtension)) {
      setMessage(`対応していないファイル形式です。対応形式: ${allowedTypes.join(', ')}`);
      return;
    }
    
    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('companyName', companyName);
    formData.append('period', period);
    try {
      await axios.post('/api/upload', formData, {headers: {'Content-Type': 'multipart/form-data'}});
      setMessage(`${companyName}の${period}年度データをアップロード成功`);
      setFile(null);
    } catch (e) {
      setMessage('アップロード失敗: ' + (e as any).response?.data?.error || 'サーバーエラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">財務データアップロード</h2>
            <Link 
              href="/" 
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ホームに戻る
            </Link>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">法人名</label>
              <input 
                type="text" 
                value={companyName} 
                onChange={e=>setCompanyName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="法人名を入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">決算期</label>
              <input 
                type="text" 
                value={period} 
                onChange={e=>setPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="例: 2024"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ファイル種別</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="bs">貸借対照表（BS）</option>
                <option value="pl">損益計算書（PL）</option>
                <option value="trial_balance">試算表</option>
                <option value="payroll">賃金台帳</option>
                <option value="settlement">決算書</option>
                <option value="other">その他</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ファイル選択
                <span className="text-xs text-gray-500 ml-2">
                  対応形式: Excel(.xlsx, .xls), PDF(.pdf), 画像(.png, .jpg), CSV(.csv)
                </span>
              </label>
              <input 
                type="file" 
                onChange={e=>setFile(e.target.files?.[0]||null)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg,.csv"
              />
            </div>
            
            <button 
              onClick={handleUpload} 
              disabled={!file||loading||!companyName||!period} 
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              {loading ? 'アップロード中...' : 'アップロード'}
            </button>
            
            {message && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                message.includes('成功') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
