// GET  /api/data  -> devuelve las nano apps guardadas (o los datos por defecto si aún no hay nada)
// POST /api/data  -> guarda las nano apps. Requiere { password, data } y valida contra process.env.ADMIN_PASSWORD

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const REDIS_KEY = 'baid_nanoapps_data_v1';

const DEFAULT_DATA = [
  {
    id:'agenda',
    name:'Agenda Inteligente',
    desc:'Agente que confirma, reagenda y recuerda citas por WhatsApp automáticamente.',
    startDate:'3 jun', dueDate:'12 jul', owner:'Diego', client:'Clínica Rivas',
    sprints:[
      { tasks:[
        {name:'Definir flujo conversacional', week:'S1', status:'done'},
        {name:'Conectar WhatsApp Business API', week:'S1', status:'done'},
        {name:'Diseñar mensajes de confirmación', week:'S1', status:'done'},
        {name:'Pruebas con calendario de prueba', week:'S1', status:'done'},
      ]},
      { tasks:[
        {name:'Integración con Google Calendar', week:'S2', status:'done'},
        {name:'Lógica de reagendado', week:'S2', status:'done'},
        {name:'Recordatorios automáticos 24h', week:'S2', status:'progress'},
        {name:'Manejo de cancelaciones', week:'S2', status:'stalled'},
      ]},
      { tasks:[
        {name:'Reportes de asistencia', week:'S3', status:'pending'},
        {name:'Panel de citas del día', week:'S3', status:'pending'},
        {name:'Notificaciones a staff', week:'S3', status:'pending'},
        {name:'QA con cliente piloto', week:'S3', status:'pending'},
      ]},
      { tasks:[
        {name:'Ajustes post feedback', week:'S4', status:'pending'},
        {name:'Optimización de prompts', week:'S4', status:'pending'},
        {name:'Documentación técnica', week:'S4', status:'pending'},
        {name:'Entrega y capacitación', week:'S4', status:'pending'},
      ]},
    ]
  },
  {
    id:'cobranza',
    name:'Cobranza Automática',
    desc:'Nano app que da seguimiento a pagos vencidos y negocia planes por chat.',
    startDate:'12 may', dueDate:'20 jun', owner:'Marisol', client:'Grupo Ferretero MX',
    sprints:[
      { tasks:[
        {name:'Mapear reglas de cobranza', week:'S1', status:'done'},
        {name:'Conectar base de clientes MySQL', week:'S1', status:'done'},
        {name:'Definir tono y escalamiento', week:'S1', status:'done'},
        {name:'Prompt base de cobranza', week:'S1', status:'done'},
      ]},
      { tasks:[
        {name:'Flujo de recordatorio 3-7-15 días', week:'S2', status:'done'},
        {name:'Generar links de pago', week:'S2', status:'done'},
        {name:'Negociación de planes', week:'S2', status:'done'},
        {name:'Registro de promesas de pago', week:'S2', status:'done'},
      ]},
      { tasks:[
        {name:'Dashboard de cartera vencida', week:'S3', status:'done'},
        {name:'Alertas a cobranza humana', week:'S3', status:'progress'},
        {name:'Integración con Make', week:'S3', status:'progress'},
        {name:'Pruebas de casos límite', week:'S3', status:'pending'},
      ]},
      { tasks:[
        {name:'Revisión legal de mensajes', week:'S4', status:'stalled'},
        {name:'Reporte semanal automático', week:'S4', status:'pending'},
        {name:'Ajuste de reglas por cliente', week:'S4', status:'pending'},
        {name:'Go-live', week:'S4', status:'pending'},
      ]},
      { tasks:[
        {name:'Monitoreo post lanzamiento', week:'S5', status:'pending'},
        {name:'Ajustes de conversión', week:'S5', status:'pending'},
        {name:'Documentación final', week:'S5', status:'pending'},
        {name:'Handoff a cliente', week:'S5', status:'pending'},
      ]},
    ]
  },
  {
    id:'soporte',
    name:'Soporte WhatsApp',
    desc:'Agente de primer nivel que resuelve dudas frecuentes y escala a humano.',
    startDate:'1 jul', dueDate:'22 jul', owner:'Diego', client:'Escuela Vive',
    sprints:[
      { tasks:[
        {name:'Levantamiento de FAQs', week:'S1', status:'done'},
        {name:'Estructura de base de conocimiento', week:'S1', status:'done'},
        {name:'Configurar WhatsApp Business API', week:'S1', status:'done'},
        {name:'Prompt de bienvenida', week:'S1', status:'progress'},
      ]},
      { tasks:[
        {name:'Clasificador de intenciones', week:'S2', status:'progress'},
        {name:'Respuestas dinámicas por categoría', week:'S2', status:'pending'},
        {name:'Escalamiento a agente humano', week:'S2', status:'pending'},
        {name:'Registro de conversaciones', week:'S2', status:'pending'},
      ]},
      { tasks:[
        {name:'Métricas de resolución', week:'S3', status:'pending'},
        {name:'Ajuste de tono de marca', week:'S3', status:'pending'},
        {name:'Pruebas con usuarios reales', week:'S3', status:'pending'},
        {name:'Entrega final', week:'S3', status:'pending'},
      ]},
    ]
  },
]
;

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const data = await redis.get(REDIS_KEY);
      return res.status(200).json(data && Array.isArray(data) && data.length ? data : DEFAULT_DATA);
    } catch (err) {
      console.error('Error leyendo Redis, devolviendo datos por defecto:', err);
      return res.status(200).json(DEFAULT_DATA);
    }
  }

  if (req.method === 'POST') {
    try {
      const { password, data } = req.body || {};

      if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ ok: false, error: 'Contraseña inválida' });
      }
      if (!Array.isArray(data)) {
        return res.status(400).json({ ok: false, error: 'Formato de datos inválido' });
      }

      await redis.set(REDIS_KEY, data);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Error guardando en Redis:', err);
      return res.status(500).json({ ok: false, error: 'Error interno al guardar' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ ok: false, error: 'Método no permitido' });
};
