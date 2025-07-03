// Teste da nova lógica de status para sistema de médias

const disciplinaExemplo = {
  id: 'teste',
  nome: 'Matemática',
  creditos: 4,
  modalidade: 'medias',
  atividades: [],
  provas: [
    { id: '1', nome: 'Prova 1', nota: 30, peso: 1 }
  ],
  totalAvaliacoes: 3, // Ainda faltam 2 provas
  faltas: 0,
  notaParcial: 30
};

console.log('\n=== TESTE NOVA LÓGICA ===');
console.log('Disciplina:', disciplinaExemplo.nome);
console.log('Modalidade:', disciplinaExemplo.modalidade);
console.log('Provas realizadas:', disciplinaExemplo.provas.length);
console.log('Total de avaliações:', disciplinaExemplo.totalAvaliacoes);
console.log('Nota atual:', disciplinaExemplo.notaParcial);

// Simular o que deveria acontecer:
// - Disciplina não está completa (1 de 3 provas)
// - Status deveria ser 'em_andamento'
// - NÃO deveria mostrar 'reprovado_nota' mesmo com nota 30

console.log('\n✅ Resultado esperado: status = "em_andamento"');
console.log('❌ Problema anterior: status = "reprovado_nota" (incorreto)');
