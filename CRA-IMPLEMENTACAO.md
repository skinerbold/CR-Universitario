# Implementação do CRA (Coeficiente de Rendimento Acadêmico)

## Resumo da Atualização

Foi implementado o conceito de **CRA (Coeficiente de Rendimento Acadêmico)** na funcionalidade "Curso Completo" da aplicação. O CRA diferencia-se do CR por ser a média ponderada de **todas as disciplinas cursadas no curso inteiro**, não apenas de um período específico.

## Conceito Implementado

### CRA vs CR
- **CR (Coeficiente de Rendimento)**: Média ponderada de um período específico ou de disciplinas parciais
- **CRA (Coeficiente de Rendimento Acadêmico)**: Média ponderada de **todo o curso**, considerando todas as disciplinas de todos os períodos

### Fórmula do CRA
```
CRA = Σ(Nota × Créditos) ÷ Σ(Créditos)
```
Onde a somatória considera **todas as disciplinas de todos os períodos** do curso.

## Alterações Implementadas

### 1. Componente ResultadoCalculos.tsx
- **Título dinâmico**: 
  - "CRA - Coeficiente de Rendimento Acadêmico" para tipo 'curso'
  - "CR - Coeficiente de Rendimento do Período" para tipo 'periodo'
  - "CR Parcial" para tipo 'parcial'
- **Label do valor**:
  - "CRA" quando tipo = 'curso'
  - "Média Ponderada" para demais tipos
- **Fórmula explicativa**: 
  - Mostra "Fórmula CRA" quando tipo = 'curso'
  - Inclui nota explicativa: "CRA considera todas as disciplinas cursadas em todos os períodos do curso"

### 2. Componente CRDesejado.tsx
Atualizado para contextualizar adequadamente o CRA:
- **Título**: "Calculadora de CRA Desejado" quando tipo = 'curso'
- **Labels de entrada**: "CRA Desejado (0-100)" quando tipo = 'curso'
- **Mensagens de validação**: Adaptadas para mostrar "CRA" ou "CR" conforme o contexto
- **Resultados**: Exibem "CRA Atual", "CRA Desejado", etc. quando apropriado
- **Mensagens de feedback**: Contextualizadas para CRA quando tipo = 'curso'

### 3. Hook useCalculadora.ts
A função `calcularCRCurso` já estava implementada corretamente:
- Coleta todas as disciplinas de todos os períodos usando `flatMap`
- Calcula a média ponderada considerando todas as disciplinas: `Σ(nota × créditos) ÷ Σ(créditos)`
- Retorna o CRA geral do curso

### 4. Componente PeriodosList.tsx
Mantido como está, pois continua mostrando "CR do Período" para cada período individual, o que é correto.

## Como Funciona na Prática

### Para o Usuário na Opção "Curso Completo":

1. **Adiciona períodos**: Usuário insere 1º, 2º, 3º períodos com suas disciplinas
2. **CRA é calculado automaticamente**: Considera todas as disciplinas de todos os períodos
3. **Interface mostra**:
   - "CRA - Coeficiente de Rendimento Acadêmico" como título
   - Valor do CRA (não mais "Média Ponderada")
   - Fórmula específica do CRA
4. **Calculadora de CRA Desejado**: Permite simular o CRA necessário para atingir uma meta

### Exemplo Prático:
- **1º Período**: Cálculo I (90 pontos, 4 créditos), Física I (85 pontos, 4 créditos)
- **2º Período**: Cálculo II (80 pontos, 4 créditos), Física II (75 pontos, 4 créditos)
- **CRA**: (90×4 + 85×4 + 80×4 + 75×4) ÷ (4+4+4+4) = 1320 ÷ 16 = **82.5**

## Benefícios da Implementação

✅ **Conceito academicamente correto**: CRA vs CR bem diferenciados
✅ **Interface clara**: Usuário entende que está vendo o CRA do curso inteiro
✅ **Cálculos precisos**: Considera todas as disciplinas de todos os períodos
✅ **Consistência**: Todas as mensagens e labels contextualizadas
✅ **Funcionalidade preservada**: Não afeta as demais opções da aplicação

## Acesso
A aplicação está rodando em: **http://localhost:8082/**
Selecione "Curso Completo" para testar a funcionalidade do CRA.
