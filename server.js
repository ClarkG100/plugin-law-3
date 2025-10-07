
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.json());

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Time frame emoji mapping
const urgencyEmoji = {
  'inmediato': '🔴',
  'hoy': '🔴',
  'mañana': '🔴',
  'esta semana': '🟠',
  'una semana': '🟠',
  '1 semana': '🟠',
  'dos semanas': '🟡',
  '2 semanas': '🟡',
  'tres semanas': '🟡',
  '3 semanas': '🟡',
  'un mes': '🟢',
  '1 mes': '🟢',
  'dos meses': '🟢',
  '2 meses': '🟢',
  'más de un mes': '🟢',
  'no urgente': '🟢'
};

// Function to send appointment email
const enviarCorreo = async (appointmentData) => {
  try {
    const {
      consultation_code,
      case_code,
      nombre,
      numero_contacto,
      email,
      fecha,
      hora,
      tipo_caso,
      resumen_caso,
      urgencia
    } = appointmentData;

    const urgenciaLower = urgencia.toLowerCase();
    const emoji = urgencyEmoji[urgenciaLower] || '⚠️';

    const subject = `Nueva Consulta Legal - ${consultation_code} - ${tipo_caso}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #1a365d; margin-bottom: 10px; font-size: 16px; }
          .info-row { margin: 8px 0; padding-left: 10px; }
          .code { background-color: #e2e8f0; padding: 8px 12px; border-radius: 4px; font-family: monospace; display: inline-block; margin: 5px 0; }
          .urgency { padding: 8px 12px; border-radius: 4px; display: inline-block; font-weight: bold; }
          .urgency-high { background-color: #fee; color: #c00; }
          .urgency-medium { background-color: #ffeaa7; color: #d63031; }
          .urgency-low { background-color: #dfe6e9; color: #2d3436; }
          .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚖️ Nueva Consulta Legal Registrada</h2>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">🔑 Códigos de Referencia</div>
              <div class="info-row">
                <strong>Código de Consulta:</strong> <span class="code">${consultation_code}</span>
              </div>
              <div class="info-row">
                <strong>Código de Caso:</strong> <span class="code">${case_code}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">👤 Información del Cliente</div>
              <div class="info-row"><strong>Nombre:</strong> ${nombre}</div>
              <div class="info-row"><strong>Teléfono:</strong> ${numero_contacto}</div>
              <div class="info-row"><strong>Email:</strong> ${email}</div>
            </div>

            <div class="section">
              <div class="section-title">📅 Detalles de la Consulta</div>
              <div class="info-row"><strong>Fecha:</strong> ${fecha}</div>
              <div class="info-row"><strong>Hora:</strong> ${hora}</div>
            </div>

            <div class="section">
              <div class="section-title">⚖️ Información del Caso</div>
              <div class="info-row"><strong>Tipo de Caso:</strong> ${tipo_caso}</div>
              <div class="info-row"><strong>Resumen:</strong></div>
              <div class="info-row" style="padding: 10px; background-color: white; border-left: 3px solid #1a365d; margin-top: 5px;">
                ${resumen_caso}
              </div>
              <div class="info-row" style="margin-top: 15px;">
                <strong>Urgencia:</strong> <span class="urgency ${urgenciaLower.includes('inmediato') || urgenciaLower.includes('hoy') || urgenciaLower.includes('mañana') ? 'urgency-high' : urgenciaLower.includes('semana') ? 'urgency-medium' : 'urgency-low'}">${emoji} ${urgencia}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">📌 Información Adicional</div>
              <div class="info-row"><strong>Fecha de Registro:</strong> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</div>
            </div>
          </div>

          <div class="footer">
            <p>Este es un mensaje automático del sistema de gestión de consultas legales.</p>
            <p>Por favor, contacte al cliente lo antes posible para confirmar la cita.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
NUEVA CONSULTA LEGAL REGISTRADA
================================

🔑 CÓDIGOS DE REFERENCIA
Código de Consulta: ${consultation_code}
Código de Caso: ${case_code}

👤 INFORMACIÓN DEL CLIENTE
Nombre: ${nombre}
Teléfono: ${numero_contacto}
Email: ${email}

📅 DETALLES DE LA CONSULTA
Fecha: ${fecha}
Hora: ${hora}

⚖️ INFORMACIÓN DEL CASO
Tipo de Caso: ${tipo_caso}
Resumen: ${resumen_caso}
Urgencia: ${emoji} ${urgencia}

📌 INFORMACIÓN ADICIONAL
Fecha de Registro: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}

---
Este es un mensaje automático del sistema de gestión de consultas legales.
Por favor, contacte al cliente lo antes posible para confirmar la cita.
    `;

    const info = await transporter.sendMail({
      from: `"Sistema de Consultas Legales" <${EMAIL_CONFIG.auth.user}>`,
      to: RECIPIENT_EMAIL,
      subject: subject,
      text: textBody,
      html: htmlBody
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const obtenerNumeroFilas = async () => {
  return Math.floor(Math.random() * 1000) + 1;
};

const agregarFila = async (rowData) => {
  console.log("Adding consultation:", rowData);
  return Math.random() > 0.2;
};

const guardarDatosRecopilados = async (caseData) => {
  console.log("Storing case data:", caseData);
  return Math.random() > 0.15;
};

// Routes
app.post('/create-appointment', async (req, res) => {
  try {
    const {
      nombre,
      numero_contacto,
      email,
      fecha,
      hora,
      tipo_caso,
      resumen_caso,
      urgencia
    } = req.body;

    if (!nombre || !numero_contacto || !email || !fecha || !hora || !tipo_caso || !resumen_caso || !urgencia) {
      const campos_faltantes = [];
      if (!nombre) campos_faltantes.push("nombre");
      if (!numero_contacto) campos_faltantes.push("numero_contacto");
      if (!email) campos_faltantes.push("email");
      if (!fecha) campos_faltantes.push("fecha");
      if (!hora) campos_faltantes.push("hora");
      if (!tipo_caso) campos_faltantes.push("tipo_caso");
      if (!resumen_caso) campos_faltantes.push("resumen_caso");
      if (!urgencia) campos_faltantes.push("urgencia");

      return res.status(400).json({
        error: "Campos requeridos faltantes",
        campos_faltantes
      });
    }

    const num_registros = await obtenerNumeroFilas();
    const consultation_code = `LAWCONS${num_registros}`;
    const case_code = `CASE${num_registros}`;

    const case_data = {
      codigo_caso: case_code,
      codigo_consulta: consultation_code,
      nombre_cliente: nombre,
      numero_contacto,
      email,
      fecha_consulta: fecha,
      hora_consulta: hora,
      tipo_caso,
      resumen_caso,
      urgencia: urgencia.toLowerCase(),
      fecha_registro: new Date().toISOString()
    };

    const row_data = [
      consultation_code,
      case_code,
      nombre,
      numero_contacto,
      email,
      fecha,
      hora,
      tipo_caso,
      resumen_caso,
      urgencia.toLowerCase()
    ];

    const response_store = await guardarDatosRecopilados(case_data);
    const response_add_row = await agregarFila(row_data);

    if (response_store && response_add_row) {
      const emailData = {
        consultation_code,
        case_code,
        nombre,
        numero_contacto,
        email,
        fecha,
        hora,
        tipo_caso,
        resumen_caso,
        urgencia
      };
      
      const emailSent = await enviarCorreo(emailData);
      
      res.json({
        estado: "Consulta registrada exitosamente",
        codigo_consulta: consultation_code,
        codigo_caso: case_code,
        email_enviado: emailSent
      });
    } else {
      res.status(500).json({
        error: "Error al procesar la solicitud"
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Error interno del sistema",
      mensaje: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    email_configured: !!EMAIL_CONFIG.auth.user
  });
});

// Export for Vercel
module.exports = app;