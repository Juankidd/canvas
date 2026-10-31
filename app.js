'use strict';

const definitions = [
  { id: 'partners', n: '01', title: 'Socios clave', icon: '🤝', desc: '¿Quiénes te ayudan a lograrlo?', color: '#7b67d9', tint: '#f0edff', questions: 'Aliados estratégicos, proveedores y socios importantes.' },
  { id: 'activities', n: '02', title: 'Actividades clave', icon: '⚙️', desc: '¿Qué debes hacer muy bien?', color: '#d98b3b', tint: '#fff4e6', questions: 'Actividades fundamentales para entregar valor.' },
  { id: 'resources', n: '03', title: 'Recursos clave', icon: '🔑', desc: '¿Qué necesitas para operar?', color: '#279e91', tint: '#e7f8f4', questions: 'Recursos humanos, físicos, intelectuales y financieros.' },
  { id: 'value', n: '04', title: 'Propuesta de valor', icon: '💎', desc: '¿Qué problema resuelves?', color: '#4c70dc', tint: '#eaf0ff', questions: 'Beneficios, diferenciadores y necesidades que satisfaces.' },
  { id: 'relationships', n: '05', title: 'Relación con clientes', icon: '♥', desc: '¿Cómo conectas con ellos?', color: '#d77094', tint: '#fff0f5', questions: 'Atención, fidelización, comunidad y comunicación.' },
  { id: 'channels', n: '06', title: 'Canales', icon: '📣', desc: '¿Cómo entregas tu valor?', color: '#8c65c4', tint: '#f5edff', questions: 'Comunicación, venta, distribución y entrega.' },
  { id: 'customers', n: '07', title: 'Segmentos de clientes', icon: '👥', desc: '¿Para quién creas valor?', color: '#2f9cb7', tint: '#e7f7fc', questions: 'Grupos de personas u organizaciones a las que sirves.' },
  { id: 'costs', n: '08', title: 'Estructura de costos', icon: '▤', desc: '¿Cuáles son tus costos principales?', color: '#cb716d', tint: '#fff0ed', questions: 'Costos fijos, variables, inversión y operación.' },
  { id: 'revenue', n: '09', title: 'Fuentes de ingresos', icon: '↗', desc: '¿Por qué y cómo te pagan?', color: '#329a6b', tint: '#e8f8ee', questions: 'Ventas, suscripciones, tarifas y otras fuentes de ingresos.' }
];

const KEY = 'canvas-studio-v2';
const UAO_LOGO = 'assets/uao-logo.png';
const $ = (id) => document.getElementById(id);

const fresh = () => ({
  name: '',
  authors: ['', '', '', ''],
  date: new Date().toISOString().slice(0, 10),
  blocks: Object.fromEntries(definitions.map(d => [d.id, []]))
});

let model = fresh();
let active = null;
let toastTimer;

function sanitize(input) {
  const result = fresh();
  if (!input || typeof input !== 'object') throw new Error('Archivo inválido');

  result.name = String(input.name || '').slice(0, 90);
  result.authors = Array.from({ length: 4 }, (_, i) => String(Array.isArray(input.authors) ? (input.authors[i] || '') : (i === 0 ? (input.author || '') : '')).slice(0, 100));
  result.date = /^\d{4}-\d{2}-\d{2}$/.test(input.date || '') ? input.date : result.date;

  for (const d of definitions) {
    const arr = input.blocks?.[d.id];
    if (Array.isArray(arr)) {
      result.blocks[d.id] = arr
        .filter(x => typeof x === 'string')
        .map(x => x.trim().slice(0, 1200))
        .filter(Boolean)
        .slice(0, 100);
    }
  }

  return result;
}

try {
  const saved = localStorage.getItem(KEY);
  if (saved) model = sanitize(JSON.parse(saved));
} catch (error) {
  console.warn('No se pudo recuperar el guardado', error);
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(model));
    $('saveState').textContent = 'Cambios guardados en este dispositivo';
  } catch (_) {
    $('saveState').textContent = 'Almacenamiento local no disponible';
  }
}

function toast(message) {
  const t = $('toast');
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function updateHeaderFields() {
  $('projectName').value = model.name;
  for (let i = 0; i < 4; i++) $('author' + (i + 1)).value = model.authors[i] || '';
  $('date').value = model.date;
}

function render() {
  const container = $('canvas');
  container.replaceChildren();

  for (const d of definitions) {
    const block = el('button', `block ${d.id}`);
    block.type = 'button';
    block.style.setProperty('--accent', d.color);
    block.style.setProperty('--tint', d.tint);
    block.setAttribute('aria-label', `Editar ${d.title}`);

    const top = el('div', 'block-top');
    top.append(el('span', 'block-number', `${d.n} / 09`), el('span', 'block-icon', d.icon));

    block.append(top, el('h3', '', d.title), el('p', 'description', d.desc));

    const content = el('div', 'block-content');
    const arr = model.blocks[d.id];

    if (!arr.length) {
      content.append(el('div', 'placeholder', '+ Añadir ideas'));
    } else {
      const limit = ['partners', 'value', 'customers'].includes(d.id) ? 7 : 4;
      for (const item of arr.slice(0, limit)) {
        content.append(el('div', 'chip', `• ${item}`));
      }
      if (arr.length > limit) {
        content.append(el('div', 'count', `+${arr.length - limit} ideas más`));
      }
    }

    block.append(content);

    const footer = el('div', 'block-footer');
    footer.append(el('span', '', arr.length ? 'Editar ideas ↗' : 'Agregar ideas +'), el('span', 'count', `${arr.length} ideas`));
    block.append(footer);

    block.addEventListener('click', () => openEditor(d.id));
    container.append(block);
  }

  const complete = definitions.filter(d => model.blocks[d.id].length).length;
  $('progressText').textContent = `${complete} de 9 bloques completos`;
  $('progressBar').style.width = `${(complete / 9) * 100}%`;
}

function openEditor(id) {
  active = id;
  const d = definitions.find(x => x.id === id);
  $('dialogNumber').textContent = `BLOQUE ${d.n} / 09`;
  $('dialogTitle').textContent = `${d.icon} ${d.title}`;
  $('dialogDesc').textContent = d.questions;
  $('newItem').value = '';
  renderItems();
  $('editor').showModal();
  $('newItem').focus();
}

function renderItems() {
  const list = $('itemsList');
  list.replaceChildren();
  const arr = model.blocks[active];
  $('itemCount').textContent = `${arr.length} ${arr.length === 1 ? 'idea' : 'ideas'}`;

  if (!arr.length) {
    list.append(el('p', 'empty', 'Aún no hay ideas. Añade la primera arriba.'));
    return;
  }

  arr.forEach((value, index) => {
    const row = el('div', 'item-row');
    const number = el('span', 'count', String(index + 1).padStart(2, '0'));
    const ta = document.createElement('textarea');
    ta.rows = 2;
    ta.maxLength = 1200;
    ta.value = value;
    ta.setAttribute('aria-label', `Editar idea ${index + 1}`);
    ta.addEventListener('input', () => {
      model.blocks[active][index] = ta.value;
      save();
      render();
    });

    const del = el('button', 'delete', '✕');
    del.type = 'button';
    del.setAttribute('aria-label', `Eliminar idea ${index + 1}`);
    del.addEventListener('click', () => {
      model.blocks[active].splice(index, 1);
      save();
      render();
      renderItems();
    });

    row.append(number, ta, del);
    list.append(row);
  });
}

function addItem() {
  const value = $('newItem').value.trim();
  if (!value) return toast('Escribe una idea antes de añadirla');
  if (model.blocks[active].length >= 100) return toast('Máximo 100 ideas por bloque');
  model.blocks[active].push(value.slice(0, 1200));
  $('newItem').value = '';
  save();
  render();
  renderItems();
  $('newItem').focus();
}

function filename(ext) {
  const base = (model.name || 'business-model-canvas')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base || 'business-model-canvas'}.${ext}`;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function exportFile(type) {
  const btn = $('pngBtn');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Generando…';
  try {
    await window.exportOffline('png', model, definitions, filename, downloadBlob, toast);
  } catch (error) {
    console.error(error);
    toast(error.message || 'No se pudo exportar el archivo');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

$('projectName').addEventListener('input', (e) => { model.name = e.target.value; save(); });
for (let i = 0; i < 4; i++) $('author' + (i + 1)).addEventListener('input', e => { model.authors[i] = e.target.value; save(); });
$('date').addEventListener('input', (e) => { model.date = e.target.value; save(); });

$('addItem').addEventListener('click', addItem);
$('newItem').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    addItem();
  }
});

$('closeDialog').addEventListener('click', () => $('editor').close());
$('editorForm').addEventListener('submit', (e) => {
  e.preventDefault();
  $('editor').close();
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('¿Borrar todos los datos de este lienzo? Esta acción no se puede deshacer.')) return;
  model = fresh();
  updateHeaderFields();
  save();
  render();
  toast('Lienzo reiniciado');
});

// Casos de estudio didácticos, simplificados, no documentos oficiales de las empresas.
const exampleCases = {
  uber: {
    name: 'Uber | Plataforma de movilidad',
    blocks: {
      partners: ['Conductores y socios de flota independientes', 'Proveedores de mapas, pagos y tecnología', 'Aseguradoras y aliados de servicios de movilidad'],
      activities: ['Conectar solicitudes de viaje con conductores', 'Desarrollar y mantener la aplicación y los algoritmos de asignación', 'Gestionar seguridad, calidad y atención de incidencias', 'Captar y activar usuarios y conductores'],
      resources: ['Plataforma tecnológica, aplicación y datos', 'Marca y base de usuarios', 'Red de conductores y vehículos disponibles', 'Equipos de ingeniería, operaciones y soporte'],
      value: ['Para pasajeros: transporte solicitado desde el móvil', 'Para conductores: acceso a oportunidades de viaje', 'Precio estimado, pago digital y seguimiento del trayecto', 'Disponibilidad de opciones de movilidad según la ciudad'],
      relationships: ['Autoservicio a través de la aplicación', 'Calificaciones mutuas y mecanismos de confianza', 'Ayuda digital, asistencia y resolución de incidencias'],
      channels: ['Aplicación móvil de Uber', 'Sitio web y campañas digitales', 'Recomendaciones, promociones y alianzas locales'],
      customers: ['Personas que necesitan desplazarse', 'Conductores que buscan ingresos mediante viajes', 'Empresas que gestionan viajes de sus equipos'],
      costs: ['Desarrollo y mantenimiento tecnológico', 'Marketing, incentivos y captación de usuarios', 'Atención al cliente y operaciones', 'Seguridad, cumplimiento y procesamiento de pagos'],
      revenue: ['Comisiones o tarifas por intermediación de viajes', 'Servicios de movilidad para empresas', 'Otros productos de movilidad según mercado']
    }
  },
  netflix: {
    name: 'Netflix | Entretenimiento por streaming',
    blocks: {
      partners: ['Estudios, productoras y titulares de derechos', 'Creadores, equipos artísticos y proveedores audiovisuales', 'Fabricantes de dispositivos y operadores de conectividad', 'Aliados comerciales y publicitarios'],
      activities: ['Producir, adquirir y licenciar contenidos', 'Operar y mejorar la plataforma de streaming', 'Personalizar recomendaciones y experiencia de usuario', 'Distribuir y promocionar estrenos'],
      resources: ['Catálogo de películas, series y otros contenidos', 'Marca, plataforma y tecnología de recomendación', 'Derechos de distribución y propiedad intelectual', 'Equipos de producción, datos y tecnología'],
      value: ['Acceso bajo demanda a entretenimiento en múltiples dispositivos', 'Contenido original y licenciado', 'Recomendaciones personalizadas', 'Distintos planes de acceso según el mercado'],
      relationships: ['Suscripción y autoservicio digital', 'Perfiles y recomendaciones personalizadas', 'Notificaciones, ayuda en línea y gestión de cuenta'],
      channels: ['Aplicación para teléfonos, televisores y otros dispositivos', 'Sitio web y comunicaciones digitales', 'Acuerdos de distribución con operadores y fabricantes'],
      customers: ['Hogares y personas que consumen entretenimiento digital', 'Usuarios que buscan series, películas y contenidos originales', 'Anunciantes en planes y mercados con publicidad'],
      costs: ['Producción, adquisición y licencias de contenido', 'Infraestructura tecnológica y distribución de video', 'Marketing y promoción de estrenos', 'Personal, operaciones y soporte'],
      revenue: ['Pagos recurrentes por suscripción', 'Ingresos publicitarios en planes compatibles', 'Otras iniciativas comerciales según mercado']
    }
  },
  nubank: {
    name: 'Nubank (Nu) | Servicios financieros digitales',
    blocks: {
      partners: ['Redes de tarjetas y sistemas de pagos', 'Proveedores de infraestructura tecnológica y seguridad', 'Entidades y aliados del ecosistema financiero', 'Proveedores de verificación de identidad y cumplimiento'],
      activities: ['Diseñar y operar productos financieros digitales', 'Evaluar riesgos, crédito y prevención del fraude', 'Desarrollar la aplicación y mejorar la experiencia', 'Atender clientes y cumplir requisitos regulatorios'],
      resources: ['Aplicación y plataforma tecnológica', 'Marca, base de clientes y capacidades analíticas', 'Licencias, capital y gestión de riesgos', 'Equipos de tecnología, finanzas y servicio'],
      value: ['Gestión financiera sencilla desde el teléfono', 'Experiencia digital con menos trámites presenciales', 'Tarjetas, cuentas y otros productos según país', 'Información transparente y control de operaciones'],
      relationships: ['Autoservicio desde la aplicación', 'Soporte digital y atención al cliente', 'Comunicación clara y experiencia personalizada'],
      channels: ['Aplicación móvil Nu', 'Sitio web y canales digitales', 'Recomendaciones y campañas de adquisición de clientes'],
      customers: ['Personas que buscan servicios financieros digitales', 'Usuarios de tarjetas y cuentas de uso cotidiano', 'Clientes interesados en ahorro, crédito y otros productos según país'],
      costs: ['Desarrollo tecnológico y ciberseguridad', 'Financiación, riesgo de crédito y provisiones', 'Cumplimiento normativo y prevención del fraude', 'Captación, atención y operaciones'],
      revenue: ['Intereses de productos de crédito', 'Ingresos de intercambio y comisiones aplicables', 'Ingresos por otros servicios financieros según país']
    }
  }
};

$('sampleSelect').addEventListener('change', (event) => {
  const choice = event.target.value;
  event.target.value = '';
  if (!choice || !exampleCases[choice]) return;
  if (definitions.some(d => model.blocks[d.id].length) &&
      !confirm('¿Reemplazar las ideas actuales por el ejemplo seleccionado? Puedes guardar antes una copia en JSON.')) return;
  const selected = exampleCases[choice];
  model = sanitize({
    name: selected.name,
    authors: ['', '', '', ''],
    date: new Date().toISOString().slice(0, 10),
    blocks: selected.blocks
  });
  updateHeaderFields();
  save();
  render();
  toast('Ejemplo de ' + selected.name.split(' | ')[0] + ' cargado. Es un caso didáctico editable.');
});

$('jsonBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ ...model, format: 'CanvasStudio', version: 2 }, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename('json'));
});

$('jsonFile').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    if (file.size > 3_000_000) throw new Error('El archivo excede 3 MB');
    const imported = sanitize(JSON.parse(await file.text()));
    if (definitions.some(d => model.blocks[d.id].length) && !confirm('¿Reemplazar tu lienzo actual con el archivo importado?')) return;
    model = imported;
    updateHeaderFields();
    save();
    render();
    toast('Respaldo importado correctamente');
  } catch (error) {
    toast(`No se pudo importar: ${error.message}`);
  } finally {
    e.target.value = '';
  }
});

$('pngBtn').addEventListener('click', () => exportFile('png'));


updateHeaderFields();
render();
