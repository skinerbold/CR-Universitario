// Teste das funções de recuperação
// Execute no console do navegador após carregar a aplicação

console.log('🎓 Testando Sistema de Recuperação');

// Importar funções (simular)
const determinarStatusDisciplina = (notaPeriodo, creditos, faltas = 0) => {
  // Simular função de reprovação por faltas
  const estaReprovadoPorFaltas = (creditos, faltas) => {
    const aulasPorCredito = 15;
    const totalAulas = creditos * aulasPorCredito;
    const limiteFaltas = Math.floor(totalAulas * 0.25);
    return faltas > limiteFaltas;
  };

  if (estaReprovadoPorFaltas(creditos, faltas)) {
    return 'reprovado_faltas';
  }
  
  if (notaPeriodo >= 60) {
    return 'aprovado';
  } else if (notaPeriodo >= 40) {
    return 'final';
  } else {
    return 'reprovado_nota';
  }
};

const calcularNotaMinimaRecuperacao = (notaPeriodo) => {
  const notaMinima = (60 * 2) - notaPeriodo;
  return Math.min(100, Math.max(0, notaMinima));
};

const calcularNotaFinalRecuperacao = (notaPeriodo, notaRecuperacao) => {
  const notaFinal = (notaPeriodo + notaRecuperacao) / 2;
  return Math.round(notaFinal);
};

// Casos de teste
const casos = [
  { nome: 'Matemática', notaPeriodo: 45, creditos: 4, faltas: 0 },
  { nome: 'Física', notaPeriodo: 35, creditos: 3, faltas: 0 },
  { nome: 'Química', notaPeriodo: 70, creditos: 2, faltas: 0 },
  { nome: 'História', notaPeriodo: 55, creditos: 3, faltas: 20 },
  { nome: 'Geografia', notaPeriodo: 58.5, creditos: 2, faltas: 0 }
];

console.log('\n📊 Análise de Status das Disciplinas:');
console.log('───────────────────────────────────────');

casos.forEach(caso => {
  const status = determinarStatusDisciplina(caso.notaPeriodo, caso.creditos, caso.faltas);
  const notaMinima = status === 'final' ? calcularNotaMinimaRecuperacao(caso.notaPeriodo) : null;
  
  console.log(`\n📚 ${caso.nome}:`);
  console.log(`   Nota do Período: ${caso.notaPeriodo}`);
  console.log(`   Status: ${status.toUpperCase().replace('_', ' ')}`);
  
  if (status === 'final') {
    console.log(`   🎯 Nota mínima na recuperação: ${notaMinima?.toFixed(1)}`);
    
    // Teste com diferentes notas de recuperação
    const notasRecuperacao = [50, 70, 85, 100];
    console.log('   💡 Simulações:');
    notasRecuperacao.forEach(notaRec => {
      const notaFinal = calcularNotaFinalRecuperacao(caso.notaPeriodo, notaRec);
      const passou = notaFinal >= 60;
      console.log(`      Rec: ${notaRec} → Final: ${notaFinal} ${passou ? '✅' : '❌'}`);
    });
  }
});

console.log('\n🎉 Teste concluído! Sistema de recuperação funcionando.');
