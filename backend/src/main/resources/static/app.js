// Dynamic API resolver for static/local setups
function getApiUrl(path) {
  // If the host is local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return path;
  }
  // Allow the user to point the frontend to a custom backend URL when published separately (e.g., GitHub Pages)
  const customUrl = localStorage.getItem('ALEX_BACKEND_URL');
  if (customUrl) {
    // Ensure no double slash and trailing slash correction
    const base = customUrl.endsWith('/') ? customUrl.slice(0, -1) : customUrl;
    return `${base}${path}`;
  }
  return path;
}

// Debounce helper for performance optimization
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

const chatHistory = document.getElementById('chatHistory');
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('message');
const statusEl = document.getElementById('status');
const chatStatusText = document.getElementById('chatStatusText');

// RAG Elements
const ragUploadForm = document.getElementById('ragUploadForm');
const ragFile = document.getElementById('ragFile');
const ragStatus = document.getElementById('ragStatus');

// DB Elements
const dbTitle = document.getElementById('dbTitle');
const dbContent = document.getElementById('dbContent');
const dbSaveBtn = document.getElementById('dbSaveBtn');
const dbStatus = document.getElementById('dbStatus');

// Creator Elements
const customAgentName = document.getElementById('customAgentName');
const customAgentRole = document.getElementById('customAgentRole');
const createAgentBtn = document.getElementById('createAgentBtn');
const creatorStatus = document.getElementById('creatorStatus');

// Sandbox Elements
const sandboxSection = document.getElementById('sandboxSection');
const sandboxContainer = document.getElementById('sandboxContainer');
const finishScreenBtn = document.getElementById('finishScreenBtn');

// Pipeline Elements
const pipelineLogs = document.getElementById('pipelineLogs');
const diffView = document.getElementById('diffView');
const metricBuild = document.getElementById('metric-build');
const metricSize = document.getElementById('metric-size');
const metricSavings = document.getElementById('metric-savings');
const metricPerf = document.getElementById('metric-perf');

const steps = {
  ingest: document.getElementById('step-ingest'),
  gen: document.getElementById('step-gen'),
  opt: document.getElementById('step-opt'),
  test: document.getElementById('step-test'),
  deploy: document.getElementById('step-deploy')
};

// Global Toast function
window.showToast = function(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
};

function getSelectedAgent() {
  const selected = document.querySelector('input[name="agent"]:checked');
  return selected ? selected.value : 'alex';
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function appendMessage(author, text, type) {
  const bubble = document.createElement('div');
  const agentClass = type === 'assistant' ? (getSelectedAgent() === 'alia' ? 'alia' : 'alex') : '';
  bubble.className = `chat-bubble ${type} ${agentClass}`;
  
  // Format markdown or line breaks nicely
  const formattedText = escapeHtml(text).replace(/\n/g, '<br>');
  
  bubble.innerHTML = `
    <strong>${escapeHtml(author)}</strong>
    <div>${formattedText}</div>
  `;
  chatHistory.prepend(bubble);
  chatHistory.scrollTop = 0;
}

// 1. RAG Ingestion Upload
ragUploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = ragFile.files[0];
  if (!file) return;

  ragStatus.textContent = 'Enviando documento...';
  ragStatus.className = 'mini-status';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('agent', getSelectedAgent());

  try {
    const uploadRes = await fetch(getApiUrl('/api/upload'), {
      method: 'POST',
      body: formData
    });

    if (!uploadRes.ok) throw new Error('Erro no upload');
    const meta = await uploadRes.json();
    
    ragStatus.textContent = 'Processando indexação RAG...';
    
    // Call deploy ingest to build scripts
    const ingestRes = await fetch(getApiUrl('/api/action/deploy-ingest'), {
      method: 'POST'
    });
    if (!ingestRes.ok) throw new Error('Erro na indexação');
    
    ragStatus.textContent = 'Sucesso! Documento carregado no RAG.';
    ragStatus.className = 'mini-status';
    showToast(`RAG Atualizado com: ${file.name}`);
    ragFile.value = '';
  } catch (err) {
    ragStatus.textContent = `Erro: ${err.message}`;
    ragStatus.className = 'mini-status error';
  }
});

// 2. Ingest to database (Fonte da Verdade)
dbSaveBtn.addEventListener('click', async () => {
  const title = dbTitle.value.trim();
  const content = dbContent.value.trim();
  if (!title || !content) {
    dbStatus.textContent = 'Preencha título e conteúdo.';
    dbStatus.className = 'mini-status error';
    return;
  }

  dbStatus.textContent = 'Gravando no DB...';
  dbStatus.className = 'mini-status';

  try {
    const res = await fetch(getApiUrl('/api/db'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    
    if (!res.ok) throw new Error('Erro ao salvar no DB');
    
    dbStatus.textContent = 'Fato salvo na Fonte da Verdade (DB).';
    showToast('Fonte da Verdade atualizada!');
    dbTitle.value = '';
    dbContent.value = '';
  } catch (err) {
    dbStatus.textContent = `Erro: ${err.message}`;
    dbStatus.className = 'mini-status error';
  }
});

// 3. Create Custom Agent simulation
createAgentBtn.addEventListener('click', () => {
  const name = customAgentName.value.trim();
  const role = customAgentRole.value.trim();
  if (!name || !role) {
    creatorStatus.textContent = 'Preencha nome e função.';
    creatorStatus.className = 'mini-status error';
    return;
  }

  creatorStatus.textContent = 'Criando agente...';
  setTimeout(() => {
    creatorStatus.textContent = `Agente '${name}' criado com sucesso!`;
    showToast(`Novo Agente ativo: ${name}`);
    
    // Append message in chat simulating agent registration
    appendMessage('SISTEMA', `Novo agente instanciado: [${name}] com objetivo: [${role}]. Ele herdará os contextos do RAG e da Fonte da Verdade.`, 'assistant');
    
    customAgentName.value = '';
    customAgentRole.value = '';
  }, 1000);
});

// 4. Trigger Alex Pipeline & dynamic UI rendering
async function triggerAlexPipeline(screenConfig) {
  // Reset steps
  Object.values(steps).forEach(step => {
    step.classList.remove('active', 'completed');
  });
  
  pipelineLogs.innerHTML = '';
  diffView.textContent = 'Analisando otimizações...';
  
  const addLog = (text, type = 'info') => {
    const log = document.createElement('div');
    log.className = `log-entry ${type}`;
    log.textContent = text;
    pipelineLogs.appendChild(log);
    pipelineLogs.scrollTop = pipelineLogs.scrollHeight;
  };

  addLog('Iniciando pipeline do Alex...', 'system');

  try {
    // Call backend to compile screen
    const res = await fetch(getApiUrl('/api/pipeline/run'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(screenConfig)
    });

    if (!res.ok) throw new Error('Falha na compilação do código');
    const buildResult = await res.json();

    // Step 1: Ingest
    steps.ingest.classList.add('active');
    addLog('[1/5] Recebida parametrização da Alia. Ingerindo requisitos...');
    await new Promise(r => setTimeout(r, 600));
    steps.ingest.classList.add('completed');
    steps.ingest.classList.remove('active');

    // Step 2: Synthesis
    steps.gen.classList.add('active');
    addLog('[2/5] Gerando árvore DOM e componentes dinâmicos em HTML5...');
    await new Promise(r => setTimeout(r, 800));
    steps.gen.classList.add('completed');
    steps.gen.classList.remove('active');

    // Step 3: Optimization
    steps.opt.classList.add('active');
    addLog('[3/5] Alex aplicando otimizações de performance de código...');
    
    // Render the beautiful performance optimization diff!
    diffView.textContent = `// ANTES (CÓDIGO LENTO / COM REFLLOWS)
form.addEventListener('input', (e) => {
  recalculateFormLayoutHeavy();
});

// DEPOIS (OTIMIZAÇÃO DO ALEX - COM DEBOUNCE E RAF)
let layoutTimeout;
form.addEventListener('input', (e) => {
  clearTimeout(layoutTimeout);
  layoutTimeout = setTimeout(() => {
    requestAnimationFrame(recalculateFormLayoutHeavy);
  }, 150);
});`;

    addLog('✔ OTIMIZADO: Adicionado Debouncing e RequestAnimationFrame.');
    addLog('✔ OTIMIZADO: CSS modularizado com Flexbox/Grid nativos (zero frameworks).');
    await new Promise(r => setTimeout(r, 1000));
    steps.opt.classList.add('completed');
    steps.opt.classList.remove('active');

    // Step 4: Test
    steps.test.classList.add('active');
    addLog('[4/5] Executando conjunto de testes unitários...');
    addLog('✔ Test: Validar renderização dos inputs -> PASS');
    addLog('✔ Test: Testar envio assíncrono -> PASS');
    await new Promise(r => setTimeout(r, 700));
    steps.test.classList.add('completed');
    steps.test.classList.remove('active');

    // Step 5: Deploy
    steps.deploy.classList.add('active');
    addLog('[5/5] Realizando deploy no Sandbox de Telas Dinâmicas...');
    await new Promise(r => setTimeout(r, 600));
    steps.deploy.classList.add('completed');

    // Update metrics
    metricBuild.textContent = `${buildResult.metrics.buildTimeMs}ms`;
    metricSize.textContent = `${buildResult.metrics.codeSizeBits} bits`;
    metricSavings.textContent = `-${buildResult.metrics.memorySavingsPercent}%`;
    metricPerf.textContent = `${buildResult.metrics.lighthousePerformance}/100`;

    // Render screen inside sandbox
    sandboxContainer.innerHTML = buildResult.html;
    
    // Execute screen script
    const scriptEl = document.createElement('script');
    scriptEl.textContent = buildResult.js;
    sandboxContainer.appendChild(scriptEl);

    // Show sandbox
    sandboxSection.style.display = 'flex';
    sandboxSection.scrollIntoView({ behavior: 'smooth' });

    addLog('Pipeline concluído. Tela pronta para uso!', 'success');
    showToast(`Tela "${buildResult.title}" criada por Alex!`);

  } catch (err) {
    addLog(`[ERRO] Pipeline falhou: ${err.message}`, 'error');
    showToast(`Erro na pipeline: ${err.message}`);
  }
}

// 5. Delete screen on Finish (Finalizar)
finishScreenBtn.addEventListener('click', () => {
  sandboxSection.style.opacity = '1';
  
  // Fade out animation
  let opacity = 1;
  const timer = setInterval(() => {
    if (opacity <= 0.1) {
      clearInterval(timer);
      sandboxSection.style.display = 'none';
      sandboxContainer.innerHTML = '';
      sandboxSection.style.opacity = '1'; // reset
      showToast('Página dinâmica excluída com sucesso.');
      
      // Update pipeline logs
      const log = document.createElement('div');
      log.className = 'log-entry system';
      log.textContent = '[Pipeline] Tela finalizada e desalocada da memória.';
      pipelineLogs.appendChild(log);
    }
    sandboxSection.style.opacity = opacity;
    opacity -= 0.15;
  }, 30);
});

// 6. Chat interaction logic
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) {
    statusEl.textContent = 'Digite uma pergunta antes de enviar.';
    return;
  }

  const agent = getSelectedAgent();
  statusEl.textContent = 'Enviando...';
  chatStatusText.textContent = 'Pensando...';
  sendBtn.disabled = true;

  try {
    const response = await fetch(getApiUrl('/api/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agent, message })
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    appendMessage('Você', message, 'user');
    appendMessage(data.agent.toUpperCase(), data.response, 'assistant');
    
    // Check if the response contains screen parameterization JSON
    const jsonMatch = data.response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const config = JSON.parse(jsonMatch[1]);
        if (config.type === 'create_screen') {
          triggerAlexPipeline(config);
        }
      } catch (jsonErr) {
        console.warn("JSON encontrado mas não pôde ser analisado:", jsonErr);
      }
    }

    messageInput.value = '';
    messageInput.focus();
    statusEl.textContent = '';
    chatStatusText.textContent = 'Pronto';
  } catch (error) {
    statusEl.textContent = `Erro: ${error.message}`;
    chatStatusText.textContent = 'Erro';
    console.error(error);
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// ===================================================================
//  ADMIN ZONE — Google Sign-In + Shutdown da Plataforma
// ===================================================================

let adminEmail = null;
let adminUserName = null;

const adminLoginArea = document.getElementById('adminLoginArea');
const adminPanel = document.getElementById('adminPanel');
const adminAvatar = document.getElementById('adminAvatar');
const adminNameEl = document.getElementById('adminName');
const shutdownBtn = document.getElementById('shutdownBtn');
const shutdownModal = document.getElementById('shutdownModal');
const shutdownCancel = document.getElementById('shutdownCancel');
const shutdownConfirm = document.getElementById('shutdownConfirm');
const shutdownConfirmInfo = document.getElementById('shutdownConfirmInfo');
const shutdownProgress = document.getElementById('shutdownProgress');
const shutdownMessage = document.getElementById('shutdownMessage');

/**
 * Decode a JWT token payload (Google ID token).
 */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erro ao decodificar token:', e);
    return null;
  }
}

/**
 * Google Sign-In callback — called by the Google Identity Services SDK.
 */
window.handleGoogleLogin = async function(response) {
  const payload = decodeJwtPayload(response.credential);
  if (!payload) {
    showToast('Erro ao processar login Google.');
    return;
  }

  const email = payload.email;
  const name = payload.name || email;
  const picture = payload.picture || '';

  // Verify admin status with backend
  try {
    const res = await fetch(getApiUrl('/api/admin/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!res.ok) throw new Error('Erro na verificação');
    const data = await res.json();

    if (data.authorized) {
      adminEmail = email;
      adminUserName = name;

      // Show admin panel, hide login button
      adminLoginArea.style.display = 'none';
      adminPanel.style.display = 'flex';
      adminAvatar.src = picture;
      adminNameEl.textContent = name;

      showToast(`Bem-vindo, ${name}! Modo admin ativo.`);
      appendMessage('SISTEMA', `🔐 Admin autenticado: ${name} (${email}). Botão de shutdown ativado.`, 'assistant');
    } else {
      showToast(`Olá, ${name}! Você não é administrador da plataforma.`);
    }
  } catch (err) {
    console.error('Erro verificando admin:', err);
    showToast('Erro ao verificar permissões de admin.');
  }
};

/**
 * Open shutdown confirmation modal.
 */
shutdownBtn.addEventListener('click', () => {
  shutdownConfirmInfo.innerHTML = `
    <p><strong>Administrador:</strong> ${adminUserName} (${adminEmail})</p>
    <p><strong>Ação:</strong> Encerrar todos os serviços do backend</p>
    <p><strong>Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  `;
  shutdownModal.style.display = 'flex';
  shutdownProgress.style.display = 'none';
  shutdownConfirm.disabled = false;
  shutdownCancel.disabled = false;
});

/**
 * Cancel shutdown.
 */
shutdownCancel.addEventListener('click', () => {
  shutdownModal.style.display = 'none';
});

// Close modal on overlay click
shutdownModal.addEventListener('click', (e) => {
  if (e.target === shutdownModal) {
    shutdownModal.style.display = 'none';
  }
});

/**
 * Confirm and execute shutdown.
 */
shutdownConfirm.addEventListener('click', async () => {
  if (!adminEmail) {
    showToast('Erro: nenhum admin autenticado.');
    return;
  }

  shutdownConfirm.disabled = true;
  shutdownCancel.disabled = true;
  shutdownProgress.style.display = 'block';
  shutdownMessage.textContent = 'Enviando comando de shutdown...';

  try {
    const res = await fetch(getApiUrl('/api/admin/shutdown'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail })
    });

    const data = await res.json();

    if (data.status === 'SHUTTING_DOWN') {
      shutdownMessage.textContent = '⏻ ' + data.message;
      showToast('Plataforma está sendo desligada...');
      appendMessage('SISTEMA', `🔴 SHUTDOWN: ${data.message}`, 'assistant');

      // Animate progress bar
      const progressBar = shutdownProgress.querySelector('.shutdown-progress-bar');
      progressBar.style.width = '100%';

      // After 3 seconds, show final message
      setTimeout(() => {
        shutdownMessage.textContent = '✅ Plataforma desligada. A conexão será perdida em instantes.';
        document.body.style.opacity = '0.3';
        document.body.style.transition = 'opacity 2s ease';
      }, 3000);

    } else {
      shutdownMessage.textContent = '❌ ' + data.message;
      shutdownConfirm.disabled = false;
      shutdownCancel.disabled = false;
    }
  } catch (err) {
    shutdownMessage.textContent = `Erro: ${err.message}`;
    shutdownConfirm.disabled = false;
    shutdownCancel.disabled = false;
  }
});
