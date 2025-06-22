import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCalculadora } from '@/hooks/useCalculadora';
import { 
  Download, 
  Upload, 
  Trash2, 
  Info, 
  Database,
  AlertCircle,
  CheckCircle,
  HardDrive
} from 'lucide-react';

const GerenciadorPersistencia = () => {
  const { persistence } = useCalculadora();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageInfo = persistence.getStorageInfo();

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const success = persistence.exportData();
      if (success) {
        showMessage('success', 'Dados exportados com sucesso!');
      } else {
        showMessage('error', 'Erro ao exportar dados.');
      }
    } catch (error) {
      showMessage('error', 'Erro inesperado ao exportar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const success = await persistence.importData(file);
      if (success) {
        showMessage('success', 'Dados importados com sucesso! Recarregue a página para ver as mudanças.');
      } else {
        showMessage('error', 'Erro ao importar dados. Verifique se o arquivo está correto.');
      }
    } catch (error) {
      showMessage('error', 'Erro inesperado ao importar dados.');
    } finally {
      setIsLoading(false);
      // Limpar o input para permitir reimportar o mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = () => {
    const confirmed = confirm(
      'Tem certeza que deseja limpar TODOS os dados salvos?\n\n' +
      'Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.'
    );
    
    if (confirmed) {
      setIsLoading(true);
      try {
        const success = persistence.clearAllData();
        if (success) {
          showMessage('success', 'Todos os dados foram limpos! Recarregue a página.');
        } else {
          showMessage('error', 'Erro ao limpar dados.');
        }
      } catch (error) {
        showMessage('error', 'Erro inesperado ao limpar dados.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Nunca' || dateString === 'Erro') return dateString;
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Database className="w-5 h-5" />
        Gerenciamento de Dados
      </h2>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : message.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {message.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {message.type === 'info' && <Info className="w-4 h-4" />}
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      {/* Informações do armazenamento */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <HardDrive className="w-4 h-4" />
          Status do Armazenamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Dados salvos:</strong> {storageInfo.hasData ? 'Sim' : 'Não'}</p>
            <p><strong>Disciplinas normais:</strong> {storageInfo.disciplinasCount}</p>
            <p><strong>Disciplinas parciais:</strong> {storageInfo.disciplinasParciaisCount}</p>
          </div>
          <div>
            <p><strong>Última modificação:</strong> {formatDate(storageInfo.lastModified)}</p>
            <p><strong>Tamanho dos dados:</strong> {formatBytes(storageInfo.storageSize)}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-1 ${storageInfo.hasData ? 'text-green-600' : 'text-gray-500'}`}>
                {storageInfo.hasData ? 'Ativo' : 'Vazio'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Ações de backup */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-800">Backup e Restauração</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exportar dados */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Fazer Backup
            </Label>
            <Button
              onClick={handleExport}
              disabled={isLoading || !storageInfo.hasData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Exportando...' : 'Exportar Dados'}
            </Button>
            <p className="text-xs text-gray-500">
              Baixa um arquivo JSON com todos os seus dados
            </p>
          </div>

          {/* Importar dados */}
          <div className="space-y-2">
            <Label htmlFor="import-file" className="text-sm font-medium text-gray-700">
              Restaurar Backup
            </Label>
            <div className="space-y-2">
              <Input
                id="import-file"
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isLoading}
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Carrega dados de um arquivo de backup
              </p>
            </div>
          </div>

          {/* Limpar dados */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Limpar Tudo
            </Label>
            <Button
              onClick={handleClearAll}
              disabled={isLoading || !storageInfo.hasData}
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? 'Limpando...' : 'Apagar Tudo'}
            </Button>
            <p className="text-xs text-gray-500">
              Remove todos os dados salvos permanentemente
            </p>
          </div>
        </div>
      </div>

      {/* Informações sobre persistência */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre o Salvamento Automático:</p>
            <ul className="space-y-1 text-xs">
              <li>• Seus dados são salvos automaticamente no navegador</li>
              <li>• Os dados persistem entre sessões</li>
              <li>• Use o backup para não perder dados ao trocar de dispositivo</li>
              <li>• Os dados ficam apenas no seu navegador (privacidade total)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenciadorPersistencia;
