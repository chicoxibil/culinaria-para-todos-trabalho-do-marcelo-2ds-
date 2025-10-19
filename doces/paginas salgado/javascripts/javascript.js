
document.addEventListener('DOMContentLoaded', () => {
  const bg = document.querySelector('.bg-doces');

  // ===== Configurações =====
  const TOTAL_DOCES = 40;           // quantos docinhos
  const INTENSITY = 1.2;            // multiplicador vertical
  const MIN_SPEED = 0.;            // velocidade vertical mínima
  const MAX_SPEED = 1;            // velocidade vertical máxima
  const MIN_ROT = -0.7;            // rotação min (graus por frame)
  const MAX_ROT = 0.7;             // rotação max (graus por frame)
  const WIDTH_RANGE = [24, 96];    // largura em px (agora mais variada)

  const SOURCES = [
    'png/marcelo.JPG' // docinho PNG transparente
  ];
  

  // helper rand
  const rand = (a,b) => a + Math.random() * (b - a);

  // cria docinhos se não existirem
  let doces = Array.from(bg.querySelectorAll('.doce'));
  while (doces.length < TOTAL_DOCES) {
    const img = document.createElement('img');
    img.className = 'doce';
    img.src = SOURCES[doces.length % SOURCES.length];
    img.alt = '';
    bg.appendChild(img);
    doces.push(img);
  }

  // inicializa parâmetros por doce (tamanho estático agora)
  doces.forEach((doce, i) => {
    const cols = Math.ceil(Math.sqrt(TOTAL_DOCES));
    const col = i % cols;
    const jitter = rand(-3, 3);
    const leftVW = (col + 0.5) * (100 / cols) + jitter;

    const vSpeed = rand(MIN_SPEED, MAX_SPEED); // velocidade vertical
    const rSpeed = rand(MIN_ROT, MAX_ROT);     // rotação
    const w = Math.round(rand(WIDTH_RANGE[0], WIDTH_RANGE[1])); // largura fixa

    // aplicamos largura estática (tamanhos diferentes entre docinhos)
    doce.style.left = `${Math.max(0, Math.min(100, leftVW))}vw`;
    doce.style.width = `${w}px`;

    doce.dataset.vSpeed = String(vSpeed);
    doce.dataset.rSpeed = String(rSpeed);
    doce.dataset.angle = '0';
    // Removemos quaisquer dados de escala dinâmica — tamanho será fixo pela largura
  });

  // estado
  let ativo = true;

  // atualiza posição vertical com base no scroll
  const updateVertical = () => {
    const y = window.scrollY;
    for (const doce of doces) {
      const speed = parseFloat(doce.dataset.vSpeed || '1');
      const ty = y * speed * INTENSITY;
      doce.dataset.ty = String(ty);
    }
  };
  updateVertical();
  window.addEventListener('scroll', () => {
    if (ativo) updateVertical();
  }, { passive: true });

  // animação contínua para rotação (aplica translateY e rotate)
  let lastTime = performance.now();
  function raf(now) {
    if (!ativo) {
      requestAnimationFrame(raf);
      return;
    }
    const dt = now - lastTime;
    lastTime = now;

    for (const doce of doces) {
      const rSpeed = parseFloat(doce.dataset.rSpeed || '0.2');
      let angle = parseFloat(doce.dataset.angle || '0');
      angle += rSpeed * (dt / 16.6667);
      doce.dataset.angle = String(angle);

      const ty = parseFloat(doce.dataset.ty || '0');
      // aplica translateY e rotate juntos; escala é controlada apenas pela largura (fixa)
      doce.style.transform = `translateY(${ty}px) rotate(${angle}deg)`;
    }

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Toggle ligar/desligar
  const toggleBtn = document.getElementById('toggle-doces');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      ativo = !ativo;
      bg.style.display = ativo ? 'block' : 'none';
      toggleBtn.innerText = ativo ? 'Desligar Docinhos' : 'Ligar Docinhos';
      if (ativo) {
        updateVertical();
      }
    });
  }

  // função pública para ajustar velocidade em tempo real (se quiser usar)
  window.setDocesSpeed = (minSpeed, maxSpeed, intensity) => {
    for (const doce of doces) {
      const v = rand(minSpeed, maxSpeed);
      doce.dataset.vSpeed = String(v);
    }
    // intensity closure isn't exposed; to change globally, edit the const above.
  };
});
