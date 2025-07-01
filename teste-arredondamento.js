// Teste do arredondamento acadêmico
// Execute com: node teste-arredondamento.js

const arredondarNotaAcademica = (nota) => {
  return Math.round(nota);
};

// Casos de teste
const casos = [
  { entrada: 86.5, esperado: 87 },
  { entrada: 86.4, esperado: 86 },
  { entrada: 86.7, esperado: 87 },
  { entrada: 86.0, esperado: 86 },
  { entrada: 85.5, esperado: 86 },
  { entrada: 85.3, esperado: 85 },
  { entrada: 75.6, esperado: 76 },
  { entrada: 75.1, esperado: 75 },
  { entrada: 0.0, esperado: 0 },
  { entrada: 100.0, esperado: 100 }
];

console.log('🎓 Teste do Arredondamento Acadêmico\n');
console.log('Entrada → Resultado | Esperado | Status');
console.log('────────────────────────────────────');

let passaram = 0;
let total = casos.length;

casos.forEach(caso => {
  const resultado = arredondarNotaAcademica(caso.entrada);
  const passou = resultado === caso.esperado;
  const status = passou ? '✅' : '❌';
  
  console.log(`${caso.entrada.toFixed(1).padStart(6)} → ${resultado.toString().padStart(8)} | ${caso.esperado.toString().padStart(8)} | ${status}`);
  
  if (passou) passaram++;
});

console.log('────────────────────────────────────');
console.log(`\nResultado: ${passaram}/${total} testes passaram`);

if (passaram === total) {
  console.log('🎉 Todos os testes passaram! O arredondamento está funcionando corretamente.');
} else {
  console.log('⚠️  Alguns testes falharam. Verifique a implementação.');
}
