const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(express.json());

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

// Recipient email
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'law-office@example.com';

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Time frame emoji mapping (Spanish time frames)
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

    // Email subject
    const subject = `Nueva Consulta Legal - ${consultation_code} - ${tipo_caso}`;

    // HTML email body
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

    // Plain text version
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

    // Send email
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

// Placeholder function to get case count - replace with your actual implementation
const obtenerNumeroFilas = async () => {
  try {
    console.log("Getting case count...");
    return Math.floor(Math.random() * 1000) + 1;
  } catch (error) {
    console.error("Error getting case count:", error);
    throw error;
  }
};

// Placeholder function to add a consultation - replace with your actual implementation
const agregarFila = async (rowData) => {
  try {
    console.log("Adding consultation with data:", rowData);
    const success = Math.random() > 0.2;
    
    if (success) {
      console.log("Consultation added successfully");
      return true;
    } else {
      console.log("Failed to add consultation");
      return false;
    }
  } catch (error) {
    console.error("Error adding consultation:", error);
    return false;
  }
};

// Placeholder function to store collected case data - replace with your actual implementation
const guardarDatosRecopilados = async (caseData) => {
  try {
    console.log("Storing collected case data:", caseData);
    const success = Math.random() > 0.15;
    
    if (success) {
      console.log("Case data stored successfully");
      return true;
    } else {
      console.log("Failed to store case data");
      return false;
    }
  } catch (error) {
    console.error("Error storing case data:", error);
    return false;
  }
};

// Route to create/schedule a legal consultation appointment with case information
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

    // Validate required fields
    if (!nombre || !numero_contacto || !email || !fecha || !hora || !tipo_caso || !resumen_caso || !urgencia) {
      const rawData = {
        "error": "Campos requeridos faltantes",
        "campos_faltantes": []
      };
      
      if (!nombre) rawData.campos_faltantes.push("nombre");
      if (!numero_contacto) rawData.campos_faltantes.push("numero_contacto");
      if (!email) rawData.campos_faltantes.push("email");
      if (!fecha) rawData.campos_faltantes.push("fecha");
      if (!hora) rawData.campos_faltantes.push("hora");
      if (!tipo_caso) rawData.campos_faltantes.push("tipo_caso");
      if (!resumen_caso) rawData.campos_faltantes.push("resumen_caso");
      if (!urgencia) rawData.campos_faltantes.push("urgencia");

      const description = `❌ Error: Faltan campos requeridos para agendar la consulta\n\n` +
        `Por favor proporcione la siguiente información:\n` +
        rawData.campos_faltantes.map(campo => `• ${campo}`).join('\n');

      return res.status(400).json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    }

    // Log received data
    console.log("Received consultation and case data:");
    console.log("Nombre del cliente: ", nombre);
    console.log("Número de contacto: ", numero_contacto);
    console.log("Email: ", email);
    console.log("Fecha de consulta: ", fecha);
    console.log("Hora de consulta: ", hora);
    console.log("Tipo de caso: ", tipo_caso);
    console.log("Resumen del caso: ", resumen_caso);
    console.log("Urgencia: ", urgencia);

    // Get case count and generate codes
    const num_registros = await obtenerNumeroFilas();
    const consultation_code = `LAWCONS${num_registros}`;
    const case_code = `CASE${num_registros}`;

    // Create case data object
    const case_data = {
      codigo_caso: case_code,
      codigo_consulta: consultation_code,
      nombre_cliente: nombre,
      numero_contacto: numero_contacto,
      email: email,
      fecha_consulta: fecha,
      hora_consulta: hora,
      tipo_caso: tipo_caso,
      resumen_caso: resumen_caso,
      urgencia: urgencia.toLowerCase(),
      fecha_registro: new Date().toISOString()
    };

    // Create consultation row data
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

    // Store case data and add consultation
    const response_store = await guardarDatosRecopilados(case_data);
    const response_add_row = await agregarFila(row_data);

    if (response_store && response_add_row) {
      // Send email notification
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
      
      // Success response
      const rawData = {
        "estado": "Consulta y caso registrados exitosamente",
        "codigo_consulta": consultation_code,
        "codigo_caso": case_code,
        "email_enviado": emailSent,
        "datos_consulta": {
          "nombre_cliente": nombre,
          "email": email,
          "telefono": numero_contacto,
          "fecha_consulta": fecha,
          "hora_consulta": hora
        },
        "datos_caso": {
          "tipo_caso": tipo_caso,
          "resumen_caso": resumen_caso,
          "urgencia": urgencia
        }
      };

      const urgenciaLower = urgencia.toLowerCase();
      const emoji = urgencyEmoji[urgenciaLower] || '⚠️';

      let description = `✅ ¡Su consulta legal y caso han sido registrados exitosamente!\n\n`;
      description += `🔑 Código de consulta: **${consultation_code}**\n`;
      description += `🔑 Código de caso: **${case_code}**\n`;
      if (emailSent) {
        description += `📧 Se ha enviado una notificación por correo electrónico\n`;
      } else {
        description += `⚠️ No se pudo enviar la notificación por correo\n`;
      }
      description += `\n📋 Detalles de su consulta:\n`;
      description += `• Nombre del cliente: ${nombre}\n`;
      description += `• Teléfono: ${numero_contacto}\n`;
      description += `• Email: ${email}\n`;
      description += `• Fecha de consulta: ${fecha}\n`;
      description += `• Hora de consulta: ${hora}\n\n`;
      description += `📋 Información del caso:\n`;
      description += `• ⚖️ Tipo de caso: ${tipo_caso}\n`;
      description += `• 📝 Resumen: ${resumen_caso}\n`;
      description += `• ${emoji} Plazo deseado: ${urgencia}\n\n`;
      description += `Videollamada legal\n`;
      description += `📞 Teléfono del bufete: (+52) 55-3141-1891\n`;
      description += `🕐 Lunes-Viernes 9:00-18:00\n`;
      description += `💼 Documentación requerida: Favor traer identificación y cualquier documento relevante a su caso.`;

      res.json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    } else {
      // Failure response
      const rawData = {
        "estado": "Error al procesar la solicitud",
        "codigo_consulta": consultation_code,
        "codigo_caso": case_code,
        "datos_consulta": {
          "nombre_cliente": nombre,
          "email": email,
          "telefono": numero_contacto,
          "fecha_consulta": fecha,
          "hora_consulta": hora
        },
        "datos_caso": {
          "tipo_caso": tipo_caso,
          "resumen_caso": resumen_caso,
          "urgencia": urgencia
        }
      };

      const urgenciaLower = urgencia.toLowerCase();
      const emoji = urgencyEmoji[urgenciaLower] || '⚠️';

      let description = `❌ Ocurrió un error al procesar su solicitud\n\n`;
      description += `🔑 Código de intento (consulta): **${consultation_code}**\n`;
      description += `🔑 Código de intento (caso): **${case_code}**\n\n`;
      description += `📋 Detalles que intentó registrar:\n`;
      description += `• 👤 Nombre del cliente: ${nombre}\n`;
      description += `• 📞 Teléfono: ${numero_contacto}\n`;
      description += `• 📧 Email: ${email}\n`;
      description += `• 📆 Fecha deseada: ${fecha}\n`;
      description += `• ⏰ Hora deseada: ${hora}\n`;
      description += `• ⚖️ Tipo de caso: ${tipo_caso}\n`;
      description += `• 📝 Resumen: ${resumen_caso}\n`;
      description += `• ${emoji} Plazo deseado: ${urgencia}\n\n`;
      description += `Por favor, contacte directamente al (+52) 55-3141-1891 para registrar su caso y consulta. 🙏\n\n`;

      res.json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    }
  } catch (error) {
    console.error("Error creating legal consultation:", error);
    
    const rawData = {
      "error": "Error interno del sistema",
      "mensaje": error.message,
      "timestamp": new Date().toISOString()
    };

    const description = `❌ Error interno del sistema\n\n` +
      `Ocurrió un error inesperado al agendar su consulta. Por favor contacte al (+52) 55-3141-1891 para asistencia.\n\n` +
      `Código de error: ${error.message}`;

    res.status(500).json({
      raw: rawData,
      markdown: "...",
      type: "markdown",
      desc: description
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const rawData = {
    "status": "OK",
    "message": "Legal consultation server is running",
    "timestamp": new Date().toISOString(),
    "endpoints": {
      "create_appointment": "/create-appointment",
      "health": "/health"
    },
    "email_configured": !!EMAIL_CONFIG.auth.user
  };

  const description = `✅ Servidor en funcionamiento\n\n` +
    `🖥️ Estado: OK\n` +
    `⏰ Timestamp: ${rawData.timestamp}\n` +
    `📧 Email configurado: ${rawData.email_configured ? 'Sí' : 'No'}\n\n` +
    `📡 Endpoints disponibles:\n` +
    `• POST /create-appointment - Agendar consulta con información del caso\n` +
    `• GET /health - Verificar estado del servidor`;

  res.json({
    raw: rawData,
    markdown: "...",
    type: "markdown",
    desc: description
  });
});

// Initialize server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Legal consultation server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Create appointment with case info: POST http://localhost:${PORT}/create-appointment`);
    console.log(`Email configured: ${EMAIL_CONFIG.auth.user}`);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

// Export app for testing purposes
module.exports = app;