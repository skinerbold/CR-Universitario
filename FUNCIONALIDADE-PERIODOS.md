# Funcionalidade: Inserir Períodos - Curso Completo

## Resumo
Foi implementada a funcionalidade de "Inserir novo período" na opção "Curso Completo" da aplicação de CRA Universitário.

## O que foi implementado

### 1. Novos Tipos (src/types/index.ts)
- Tipo `Periodo` para representar períodos acadêmicos contendo disciplinas

### 2. Componentes Criados
- **PeriodoForm.tsx**: Formulário para adicionar um novo período com múltiplas disciplinas
- **PeriodosList.tsx**: Lista exibindo todos os períodos salvos com detalhes das disciplinas

### 3. Hook Atualizado (useCalculadora.ts)
- Adicionado estado `periodos` com persistência
- Funções: `adicionarPeriodo`, `removerPeriodo`, `limparPeriodos`
- Função `calcularCRCurso` para calcular o CR geral usando todas as disciplinas de todos os períodos

### 4. Interface Principal (Index.tsx)
- Integração dos novos componentes na opção "Curso Completo"
- Condicionais para exibir formulário e lista de períodos apenas quando tipoCalculo === 'curso'

## Como Usar

1. **Selecionar "Curso Completo"** no seletor de tipo de cálculo
2. **Preencher o formulário** "Inserir Novo Período":
   - Nome da disciplina
   - Nota (0-100)
   - Créditos
   - Pode adicionar múltiplas disciplinas por período
3. **Salvar** - O período será automaticamente numerado como "1º Período", "2º Período", etc.
4. **Visualizar** os períodos salvos com:
   - Lista de disciplinas
   - CR do período
   - Opção de remover período
5. **Cálculo automático** do CR geral do curso considerando todas as disciplinas de todos os períodos

## Características

- ✅ Numeração automática dos períodos (1º, 2º, 3º...)
- ✅ Múltiplas disciplinas por período
- ✅ Validação de campos (notas 0-100, créditos > 0)
- ✅ Persistência no localStorage
- ✅ Interface responsiva
- ✅ Não interfere nas demais funcionalidades
- ✅ Cálculo correto do CR geral

## Resultado
O usuário pode agora gerenciar períodos completos na opção "Curso Completo", com experiência similar às outras opções da aplicação, mantendo a consistência visual e funcional.
