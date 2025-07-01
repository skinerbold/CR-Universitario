// Teste para verificar o sistema de recuperação no frontend

// Importar as funções utilitárias
const { determinarStatusDisciplina, calcularNotaMinimaRecuperacao, disciplinaEstaCompleta } = require('./src/utils/avaliacaoUtils.ts');

// Teste 1: Status de disciplina com nota de final
console.log('\n=== TESTE STATUS DISCIPLINA ===');
const notaFinal = 45;
const creditos = 4;
const faltas = 0;

const status = determinarStatusDisciplina(notaFinal, creditos, faltas);
console.log(`Nota: ${notaFinal}, Status: ${status}`);

// Teste 2: Nota mínima para recuperação
if (status === 'final') {
  const notaMinima = calcularNotaMinimaRecuperacao(notaFinal);
  console.log(`Nota mínima na recuperação: ${notaMinima}`);
}

// Teste 3: Disciplina de exemplo
const disciplinaExemplo = {
  id: 'teste',
  nome: 'Matemática',
  creditos: 4,
  modalidade: 'pontos',
  atividades: [
    { id: '1', nome: 'Prova 1', notaObtida: 20, notaTotal: 40 },
    { id: '2', nome: 'Prova 2', notaObtida: 25, notaTotal: 60 }
  ],
  provas: [],
  faltas: 0
};

console.log('\n=== TESTE DISCIPLINA COMPLETA ===');
const estaCompleta = disciplinaEstaCompleta(disciplinaExemplo);
console.log(`Disciplina está completa: ${estaCompleta}`);

// Calcular nota da disciplina
const pontosObtidos = disciplinaExemplo.atividades.reduce((acc, at) => acc + at.notaObtida, 0);
const pontosTotal = disciplinaExemplo.atividades.reduce((acc, at) => acc + at.notaTotal, 0);
const notaDisciplina = pontosTotal > 0 ? (pontosObtidos / pontosTotal) * 100 : 0;

console.log(`Pontos obtidos: ${pontosObtidos}/${pontosTotal}`);
console.log(`Nota da disciplina: ${notaDisciplina.toFixed(1)}`);

const statusDisciplina = determinarStatusDisciplina(notaDisciplina, disciplinaExemplo.creditos, disciplinaExemplo.faltas);
console.log(`Status da disciplina: ${statusDisciplina}`);

if (statusDisciplina === 'final') {
  const notaMinimaRec = calcularNotaMinimaRecuperacao(notaDisciplina);
  console.log(`Nota mínima na recuperação: ${notaMinimaRec.toFixed(1)}`);
}
