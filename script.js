document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Animazione Contatori Numerici Hero
  const metrics = document.querySelectorAll('.metric-value');
  
  metrics.forEach(metric => {
    const target = parseInt(metric.getAttribute('data-target'));
    if (target === 0) {
      metric.innerText = '0';
      return;
    }
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        metric.innerText = target;
        clearInterval(timer);
      } else {
        metric.innerText = Math.ceil(current);
      }
    }, 40);
  });

  // 2. Logica Assessment Interattivo
  let assessmentData = {
    obiettivo: '',
    modalita: '',
    nome: '',
    telefono: ''
  };

  const step1 = document.querySelector('.form-step[data-step="1"]');
  const step2 = document.querySelector('.form-step[data-step="2"]');
  const step3 = document.querySelector('.form-step[data-step="3"]');

  // Step 1 Click
  step1.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      assessmentData.obiettivo = btn.getAttribute('data-val');
      step1.classList.remove('active');
      step2.classList.add('active');
    });
  });

  // Step 2 Click
  step2.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      assessmentData.modalita = btn.getAttribute('data-val');
      step2.classList.remove('active');
      step3.classList.add('active');
    });
  });

  // Step 3 Submit
  const form = document.getElementById('interactive-assessment');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    assessmentData.nome = document.getElementById('athlete-name').value;
    assessmentData.telefono = document.getElementById('athlete-phone').value;

    const message = `Ciao Cesare, sono ${assessmentData.nome}. Ho completato l'Assessment Biomeccanico sul tuo sito:%0A- Obiettivo: ${assessmentData.obiettivo}%0A- Modalità: ${assessmentData.modalita}%0A- Contatto: ${assessmentData.telefono}`;
    
    // Reindirizzamento WhatsApp diretto con profilo dell'atleta pre-compilato
    window.location.href = `https://wa.me/393000000000?text=${message}`;
  });

});
