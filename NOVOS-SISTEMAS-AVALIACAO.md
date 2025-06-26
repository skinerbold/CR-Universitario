# Sistemas de Avaliação: Pontos e Médias

Este documento detalha as novas funcionalidades implementadas para suportar dois sistemas de avaliação por disciplina na aplicação de acompanhamento universitário.

## 📋 Visão Geral

A partir desta versão, a aplicação suporta dois sistemas de avaliação para disciplinas parciais:

1. **Sistema de Pontos** (padrão para disciplinas existentes)
2. **Sistema de Médias** (novo sistema)

## 🎯 Sistema de Pontos

### Como funciona:
- Atividades avaliativas somam pontos até um total de 100 pontos por disciplina
- A nota final da disciplina é a soma dos pontos obtidos (máximo 100)
- Ideal para disciplinas com muitas atividades pequenas

### Características:
- ✅ Atividades com valores diversos (ex: 10, 15, 20 pontos)
- ✅ Controle de "pontos consumidos" vs "pontos disponíveis"
- ✅ Visualização de progresso por pontos
- ✅ Animação verde quando uma atividade é cadastrada

## 📊 Sistema de Médias

### Como funciona:
- Define um número total de avaliações (provas) para a disciplina
- Cada prova vale de 0 a 100 pontos
- A nota final é calculada por média simples ou ponderada
- Suporte a pesos customizáveis para cada prova

### Características:
- ✅ Número fixo de avaliações definido no cadastro
- ✅ Provas com pesos customizáveis (padrão: peso 1)
- ✅ Cálculo automático de média ponderada
- ✅ Controle de progresso por número de provas realizadas
- ✅ Interface diferenciada com animação verde

### Fórmulas:
- **Média Simples**: `(P1 + P2 + ... + Pn) / n`
- **Média Ponderada**: `(P1×W1 + P2×W2 + ... + Pn×Wn) / (W1 + W2 + ... + Wn)`

## 🛠️ Como Usar

### Cadastrando uma Disciplina

1. **No formulário de disciplina parcial:**
   - Escolha a modalidade: "Sistema de Pontos" ou "Sistema de Médias"
   - Para Sistema de Médias: defina o número total de avaliações

### Sistema de Pontos
1. Cadastre atividades com seus respectivos valores
2. Acompanhe o progresso pelos pontos obtidos/total
3. A nota final é a soma dos pontos (máx. 100)

### Sistema de Médias
1. Cadastre provas conforme o número definido
2. Defina pesos customizados se necessário (padrão: peso 1)
3. A nota final é calculada automaticamente pela média ponderada

## 🎨 Interface

### Diferenciação Visual:
- **Sistema de Pontos**: Cards laranjas com ícone de calculadora
- **Sistema de Médias**: Cards roxos com ícone de estrela
- **Resultados**: Mostra quantas disciplinas de cada tipo estão ativas

### Componentes:
- `DisciplinasParciaisList`: Gerencia disciplinas do sistema de pontos
- `DisciplinasMediasList`: Gerencia disciplinas do sistema de médias
- `ResultadoCalculos`: Exibe estatísticas consolidadas dos dois sistemas

## 🔄 Migração Automática

- **Disciplinas existentes**: Automaticamente migradas para "Sistema de Pontos"
- **Compatibilidade**: Mantém 100% das funcionalidades anteriores
- **Sem perda de dados**: Todas as atividades são preservadas

## 📱 Recursos Avançados

### Controle de Faltas:
- ✅ Funciona em ambos os sistemas
- ✅ Adicionar/remover faltas individuais
- ✅ Adicionar aulas duplas (2 faltas)
- ✅ Definir número total de faltas
- ✅ Cálculo automático de reprovação por faltas

### Validações:
- ✅ Notas entre 0-100 em ambos os sistemas
- ✅ Pesos positivos no sistema de médias
- ✅ Limite de provas conforme número definido
- ✅ Feedback visual para erros

### Persistência:
- ✅ Dados salvos automaticamente no localStorage
- ✅ Migração automática na primeira carga
- ✅ Compatibilidade com backups existentes

## 🧮 Cálculo de CR/CRA

### Fórmula Unificada:
```
CR = Σ(Nota_Disciplina × Créditos) / Σ(Créditos)
```

Onde `Nota_Disciplina` é:
- **Sistema de Pontos**: Soma dos pontos obtidos (máx. 100)
- **Sistema de Médias**: Média ponderada das provas (0-100)

### Exemplo Prático:

**Disciplina A (Pontos, 4 créditos):**
- Atividade 1: 8/10 pontos
- Atividade 2: 15/20 pontos
- Nota final: 23 pontos

**Disciplina B (Médias, 6 créditos, 3 provas):**
- Prova 1: 80 pontos (peso 1)
- Prova 2: 90 pontos (peso 2)
- Prova 3: 70 pontos (peso 1)
- Nota final: (80×1 + 90×2 + 70×1)/(1+2+1) = 82.5

**CR Parcial:**
```
CR = (23×4 + 82.5×6) / (4+6) = (92 + 495) / 10 = 58.7
```

## 🚀 Benefícios

1. **Flexibilidade**: Adaptação a diferentes metodologias de ensino
2. **Precisão**: Cálculos mais precisos conforme o sistema da disciplina
3. **Usabilidade**: Interface intuitiva para cada modalidade
4. **Compatibilidade**: Mantém funcionamento com dados existentes
5. **Escalabilidade**: Base para futuras modalidades de avaliação

## 🔧 Arquivos Principais

- `src/types/index.ts`: Definições de tipos
- `src/utils/avaliacaoUtils.ts`: Utilitários de cálculo
- `src/hooks/useCalculadora.ts`: Lógica principal
- `src/components/DisciplinaParcialForm.tsx`: Formulário de cadastro
- `src/components/DisciplinasMediasList.tsx`: Interface do sistema de médias
- `src/components/ResultadoCalculos.tsx`: Exibição de resultados

---

**Versão**: 2.0.0  
**Data**: Dezembro 2024  
**Desenvolvedor**: Skiner Bold
