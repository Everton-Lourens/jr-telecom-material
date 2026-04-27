// JR TELECOM - CAMAÇARI
// Aplicação 100% estática para GitHub Pages.

const COMPANY_NAME = 'JR TELECOM - CAMAÇARI';
const RESPONSIBLE_NAME = 'Everton Lourenço';
const WHATSAPP_NUMBER = '5571996122630'; // Formato internacional para wa.me
const MATERIALS = [
  {
    id: 'bucha-acabamento',
    name: 'Bucha de Acabamento',
    description: 'Bucha para deixar o furo na parede menos aparente.'
  },
  {
    id: 'placa-jr',
    name: 'Placa Jr Telecom',
    description: 'Placa para identificaçãode drop nos postes.'
  },
  {
    id: 'fixa-fio',
    name: 'Fixa fio',
    description: 'Fixa fio para prender o drop na casa dos clientes.'
  },
  {
    id: 'conector-sc-apc',
    name: 'Conector SC/APC',
    description: 'Tomadas e pontos elétricos de apoio à instalação.'
  },
  {
    id: 'bucha-parafuso',
    name: 'Bucha e Parafuso',
    description: 'Bucha e Parausos para fixar equipamentosna parede.'
  },
  {
    id: 'fita-isolante',
    name: 'Fita isolante',
    description: 'Fita para isolamento, acabamento e segurança.'
  },
  {
    id: 'abracadeira',
    name: 'Abraçadeira',
    description: 'Organização de cabos e fixação em instalações.'
  },
  {
    id: 'aspiral-macarrao',
    name: 'Aspiral/Macarrão',
    description: 'Itens e materiais para organização de cabos.'
  }
];

const form = document.getElementById('requestForm');
const technicianInput = document.getElementById('technicianName');
const companyInput = document.getElementById('companyName');
const dateInput = document.getElementById('requestDate');
const timeInput = document.getElementById('requestTime');
const sectorInput = document.getElementById('sector');
const internalIdInput = document.getElementById('internalId');
const observationsInput = document.getElementById('observations');
const feedbackEl = document.getElementById('feedback');
const materialsListEl = document.getElementById('materialsList');
const searchInput = document.getElementById('materialSearch');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');

companyInput.value = COMPANY_NAME;

function pad(value) {
  return String(value).padStart(2, '0');
}

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const date = `${year}-${month}-${day}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return { date, time };
}

function setDefaultDateTime() {
  const { date, time } = getCurrentDateTime();
  if (!dateInput.value) dateInput.value = date;
  if (!timeInput.value) timeInput.value = time;
}

function formatDateBR(dateString) {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

function formatTimeBR(timeString) {
  if (!timeString) return '-';
  return timeString;
}

function sanitizeText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

function escapeFilename(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'solicitacao';
}

function showFeedback(type, message) {
  feedbackEl.className = `feedback show ${type}`;
  feedbackEl.textContent = message;
}

function clearFeedback() {
  feedbackEl.className = 'feedback';
  feedbackEl.textContent = '';
}

function createMaterialCard(material) {
  const article = document.createElement('article');
  article.className = 'material-item';
  article.dataset.materialId = material.id;
  article.dataset.search = `${material.name} ${material.description}`.toLowerCase();

  article.innerHTML = `
    <div class="material-top">
      <input type="checkbox" id="${material.id}" class="material-check" aria-label="Selecionar ${material.name}" />
      <div class="material-label">
        <label for="${material.id}" class="material-name">${material.name}</label>
        <div class="material-desc">${material.description}</div>
      </div>
    </div>
    <div class="qty-wrap">
      <label for="${material.id}-qty">Quantidade</label>
      <input
        type="number"
        min="1"
        step="1"
        value="1"
        id="${material.id}-qty"
        class="qty-input"
        inputmode="numeric"
        aria-label="Quantidade de ${material.name}"
      />
    </div>
  `;

  const checkbox = article.querySelector('.material-check');
  const qtyWrap = article.querySelector('.qty-wrap');
  const qtyInput = article.querySelector('.qty-input');

  const syncSelection = () => {
    article.classList.toggle('selected', checkbox.checked);
    qtyWrap.style.display = checkbox.checked ? 'grid' : 'none';
    if (checkbox.checked && (!qtyInput.value || Number(qtyInput.value) < 1)) {
      qtyInput.value = 1;
    }
  };

  checkbox.addEventListener('change', syncSelection);
  qtyInput.addEventListener('input', () => {
    if (qtyInput.value === '' || Number(qtyInput.value) < 1) {
      qtyInput.value = '';
    }
  });

  syncSelection();
  return article;
}

function renderMaterials(filter = '') {
  materialsListEl.innerHTML = '';
  const term = filter.trim().toLowerCase();

  const filtered = MATERIALS.filter((material) =>
    `${material.name} ${material.description}`.toLowerCase().includes(term)
  );

  if (!filtered.length) {
    materialsListEl.innerHTML = '<p class="material-desc">Nenhum material encontrado para essa busca.</p>';
    return;
  }

  filtered.forEach((material) => {
    materialsListEl.appendChild(createMaterialCard(material));
  });
}

function getSelectedMaterials() {
  const selected = [];
  document.querySelectorAll('.material-item').forEach((item) => {
    const checkbox = item.querySelector('.material-check');
    const qtyInput = item.querySelector('.qty-input');
    if (checkbox.checked) {
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 0);
      selected.push({
        name: item.querySelector('.material-name').textContent.trim(),
        quantity: qty
      });
    }
  });
  return selected;
}

function buildTxtContent(data, selectedMaterials, fileGenerationDate, fileGenerationTime) {
  const materialsText = selectedMaterials.length
    ? selectedMaterials.map((item) => `- ${item.name}: ${item.quantity}`).join('\n')
    : '- Nenhum material selecionado';

  return [
    'SOLICITAÇÃO DE MATERIAIS',
    '========================================',
    `Empresa: ${COMPANY_NAME}`,
    `Nome do técnico: ${data.technicianName}`,
    `Data da solicitação: ${formatDateBR(data.requestDate)}`,
    `Hora da solicitação: ${formatTimeBR(data.requestTime)}`,
    `Setor/local: ${data.sector || '-'}`,
    `Identificação complementar: ${data.internalId || '-'}`,
    '',
    'Materiais solicitados:',
    materialsText,
    '',
    'Observações:',
    data.observations || '-',
    '',
    '========================================',
    `Arquivo gerado em: ${fileGenerationDate} às ${fileGenerationTime}`
  ].join('\n');
}

function buildWhatsAppMessage(data, selectedMaterials) {
  const materialsText = selectedMaterials.length
    ? selectedMaterials.map((item) => `• ${item.name} x${item.quantity}`).join('\n')
    : '• Nenhum material selecionado';

  return [
    `*SOLICITAÇÃO DE MATERIAIS*`,
    `*Empresa:* ${COMPANY_NAME}`,
    `*Técnico:* ${data.technicianName}`,
    `*Data:* ${formatDateBR(data.requestDate)}`,
    `*Hora:* ${formatTimeBR(data.requestTime)}`,
    `*Setor/local:* ${data.sector || '-'}`,
    `*Identificação complementar:* ${data.internalId || '-'}`,
    '',
    '*Materiais solicitados:*',
    materialsText,
    '',
    `*Observações:* ${data.observations || '-'}`,
    '',
    `Se houver falha no envio automático, entre em contato com ${RESPONSIBLE_NAME}.`
  ].join('\n');
}

function downloadTextFile(content, filename) {
  const blob = new Blob([`\ufeff${content}`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openWhatsApp(message) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  const win = window.open(url, '_blank', 'noopener,noreferrer');

  if (!win) {
    window.location.href = url;
    return false;
  }

  return true;
}

function validateForm() {
  const technicianName = sanitizeText(technicianInput.value);
  if (!technicianName) {
    showFeedback('error', 'Informe o nome do técnico antes de enviar.');
    technicianInput.focus();
    return false;
  }

  const selectedMaterials = getSelectedMaterials();
  if (!selectedMaterials.length) {
    showFeedback('error', 'Selecione ao menos um material para continuar.');
    return false;
  }

  for (const item of selectedMaterials) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      showFeedback('error', `A quantidade do item "${item.name}" precisa ser maior que zero.`);
      return false;
    }
  }

  return true;
}

function collectFormData() {
  return {
    technicianName: sanitizeText(technicianInput.value),
    requestDate: dateInput.value,
    requestTime: timeInput.value,
    sector: sanitizeText(sectorInput.value),
    internalId: sanitizeText(internalIdInput.value),
    observations: sanitizeText(observationsInput.value)
  };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearFeedback();

  if (!validateForm()) return;

  const data = collectFormData();
  const selectedMaterials = getSelectedMaterials();
  const generationNow = new Date();
  const fileGenerationDate = generationNow.toLocaleDateString('pt-BR');
  const fileGenerationTime = generationNow.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const txtContent = buildTxtContent(data, selectedMaterials, fileGenerationDate, fileGenerationTime);
  const fileName = `solicitacao_${escapeFilename(data.technicianName)}_${data.requestDate || 'sem_data'}.txt`;

  downloadTextFile(txtContent, fileName);

  const message = buildWhatsAppMessage(data, selectedMaterials);
  const opened = openWhatsApp(message);
/**
  if (opened) {
    showFeedback('success', `Solicitação gerada com sucesso. O arquivo .txt foi baixado e o WhatsApp foi aberto para envio.`);
  } else {
    showFeedback('info', `Não foi possível abrir automaticamente. Entre em contato com ${RESPONSIBLE_NAME}. O arquivo .txt já foi baixado.`);
  }
  **/
});

searchInput.addEventListener('input', (event) => {
  renderMaterials(event.target.value);
});

clearSelectionBtn.addEventListener('click', () => {
  document.querySelectorAll('.material-item').forEach((item) => {
    const checkbox = item.querySelector('.material-check');
    const qtyInput = item.querySelector('.qty-input');
    checkbox.checked = false;
    qtyInput.value = 1;
    item.classList.remove('selected');
    item.querySelector('.qty-wrap').style.display = 'none';
  });
  showFeedback('info', 'Seleção de materiais limpa.');
});

setDefaultDateTime();
renderMaterials();

if (!technicianInput.value) {
  technicianInput.focus();
}
