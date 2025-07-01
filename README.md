# 🎓 Calculadora de CRA Universitário

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple?logo=vite)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-success?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Uma aplicação web moderna e responsiva para calcular o **Coeficiente de Rendimento Acadêmico (CRA)** universitário, com suporte a múltiplos sistemas de avaliação e funcionalidades avançadas de simulação.

## ✨ Funcionalidades

### 📊 **Cálculo de CRA**
- **CRA por Período**: Calcule a média de disciplinas específicas de um período
- **CRA do Curso**: Visualize sua média geral de todo o curso
- **CRA Parcial**: Inclua disciplinas em andamento nos cálculos

### 🎯 **Sistemas de Avaliação**
- **Sistema de Pontos**: Para disciplinas com atividades pontuadas
- **Sistema de Médias**: Para disciplinas com provas tradicionais
- **Migração Automática**: Conversão transparente entre sistemas

### 📈 **Simulações Inteligentes**
- **CRA Desejado**: Descubra que notas precisa para atingir sua meta
- **Análise de Progresso**: Acompanhe seu desempenho em tempo real
- **Disciplinas Incompletas**: Identifique matérias que precisam de atenção

### 📱 **Experience Mobile**
- **PWA (Progressive Web App)**: Instale como aplicativo nativo
- **Offline First**: Funciona sem internet após instalação
- **Design Responsivo**: Otimizado para todos os dispositivos
- **Interface Moderna**: UI/UX com shadcn/ui e Tailwind CSS

### 💾 **Persistência de Dados**
- **LocalStorage**: Dados salvos automaticamente no navegador
- **Backup/Restore**: Import/export de dados em JSON
- **Histórico**: Controle de última modificação

## 🚀 Início Rápido

### Pré-requisitos
- **Node.js** 18+ ([Instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **npm** ou **yarn**

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/cra-universitario.git

# Entre no diretório
cd cra-universitario

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

### Build para Produção

```bash
# Build otimizado
npm run build

# Preview da build
npm run preview
```

## 🛠️ Stack Tecnológica

### **Frontend**
- **[React 18](https://reactjs.org/)** - Biblioteca para interfaces de usuário
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática para JavaScript
- **[Vite](https://vitejs.dev/)** - Build tool rápido e moderno

### **UI/UX**
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes React modernos
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Lucide Icons](https://lucide.dev/)** - Ícones SVG otimizados
- **[Radix UI](https://www.radix-ui.com/)** - Primitivos acessíveis

### **Gerenciamento de Estado**
- **[TanStack Query](https://tanstack.com/query)** - Gerenciamento de estado servidor
- **React Hooks** - Estado local e efeitos

### **PWA & Performance**
- **Service Worker** - Cache e funcionalidade offline
- **Web App Manifest** - Instalação como app nativo
- **Lazy Loading** - Carregamento otimizado de componentes

## 📱 Instalação como PWA

### **Desktop (Chrome/Edge)**
1. Acesse a aplicação no navegador
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

### **Mobile (iOS/Android)**
1. Abra no Safari/Chrome mobile
2. Menu → "Adicionar à Tela Inicial"
3. Confirme a instalação

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── Calculadora.tsx # Lógica principal de cálculo
│   ├── DisciplinaForm.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── useCalculadora.ts
│   └── usePersistentState.ts
├── pages/              # Páginas da aplicação
├── types/              # Definições TypeScript
├── utils/              # Funções utilitárias
└── lib/                # Configurações e helpers
```

## 🔧 Configuração de Desenvolvimento

### **ESLint**
```bash
npm run lint
```

### **Variáveis de Ambiente**
Crie um arquivo `.env` na raiz:
```env
VITE_APP_NAME=Calculadora CRA
VITE_VERSION=1.0.0
```

## 📊 Sistemas de Avaliação Suportados

### **Sistema de Pontos**
- Atividades com pontuação específica
- Cálculo baseado em pontos obtidos/totais
- Suporte a pesos diferenciados

### **Sistema de Médias**
- Provas tradicionais (0-100)
- Média aritmética ponderada
- Configuração de número de avaliações

## 🔢 **Arredondamento Acadêmico**
- **Arredondamento Inteligente**: Notas finais seguem o padrão acadêmico
  - 86.5 → 87 (arredonda para cima)
  - 86.4 → 86 (arredonda para baixo)
  - 86.7 → 87 (arredonda para cima)
- **Aplicação Automática**: Funciona em ambos os sistemas (pontos e médias)

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🐛 Issues & Suporte

Encontrou um bug ou tem uma sugestão? 
- [Abra uma issue](https://github.com/seu-usuario/cra-universitario/issues)
- [Discussões](https://github.com/seu-usuario/cra-universitario/discussions)

## 🎯 Roadmap

- [ ] Integração com sistemas acadêmicos
- [ ] Gráficos de evolução do CRA
- [ ] Notificações de metas
- [ ] Modo escuro
- [ ] Calculadora de ENADE

---

<div align="center">
  <sub>Construído com ❤️ para estudantes universitários</sub>
</div>
