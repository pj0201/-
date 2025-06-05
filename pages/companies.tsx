import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import axios from 'axios';

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface UploadedFile {
  id: number;
  filename: string;
  file_type: string;
  period: string;
  upload_date: string;
  file_size: number;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyFiles, setCompanyFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
    } catch (err) {
      setError('企業データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyFiles = async (companyId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/files/${companyId}`);
      setCompanyFiles(response.data);
    } catch (err) {
      setError('ファイルデータの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    fetchCompanyFiles(company.id);
  };

  const getFileTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'bs': '貸借対照表',
      'pl': '損益計算書',
      'trial_balance': '試算表',
      'payroll': '賃金台帳',
      'settlement': '決算書',
      'other': 'その他'
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">企業選択</h1>
            <p className="mt-2 text-sm text-gray-600">
              企業を選択して財務データを確認できます
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 企業一覧 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">登録企業一覧</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {loading && companies.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">読み込み中...</div>
                ) : companies.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    登録された企業がありません
                    <br />
                    <span className="text-sm">ファイルアップロードから企業を登録してください</span>
                  </div>
                ) : (
                  companies.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className={`p-4 cursor-pointer transition-colors duration-150 ${
                        selectedCompany?.id === company.id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {company.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            登録日: {new Date(company.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-gray-400" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 選択企業の詳細 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedCompany ? `${selectedCompany.name} の財務データ` : '企業詳細'}
                </h2>
              </div>
              <div className="p-6">
                {!selectedCompany ? (
                  <div className="text-center text-gray-500">
                    左側から企業を選択してください
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">企業情報</h3>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">企業名:</span> {selectedCompany.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">登録日:</span> {new Date(selectedCompany.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">アップロード済みファイル</h3>
                      {loading ? (
                        <div className="text-center py-4 text-gray-500">読み込み中...</div>
                      ) : companyFiles.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          アップロードされたファイルがありません
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {companyFiles.map((file) => (
                            <div key={file.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {file.filename}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {getFileTypeLabel(file.file_type)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {file.period}年度
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatFileSize(file.file_size)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(file.upload_date).toLocaleDateString('ja-JP')} にアップロード
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}