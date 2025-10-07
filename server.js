const express = require('express');

const app = express();

const PORT = 3000;

app.use(express.json());

// Urgency emoji mapping
const urgencyEmoji = {
  'baja': '🟢',
  'media': '🟡',
  'alta': '🟠',
  'crítica': '🔴',
  'urgente': '🔴'
};

// Placeholder function to get case count - replace with your actual implementation
const obtenerNumeroFilas = async () => {
  try {
    // This is a placeholder - implement your actual logic here
    // For example: Case management system API, database query, etc.
    console.log("Getting case count...");
    // Return a mock value for demonstration
    return Math.floor(Math.random() * 1000) + 1;
  } catch (error) {
    console.error("Error getting case count:", error);
    throw error;
  }
};

// Placeholder function to add a consultation - replace with your actual implementation
const agregarFila = async (rowData) => {
  try {
    // This is a placeholder - implement your actual logic here
    // For example: Case management system API, database insert, etc.
    console.log("Adding consultation with data:", rowData);
    
    // Simulate successful operation (80% success rate for demo)
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
    // This is a placeholder - implement your actual logic here
    // For example: Database insert, CRM system, etc.
    console.log("Storing collected case data:", caseData);
    
    // Simulate successful operation (85% success rate for demo)
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
      // Success response
      const rawData = {
        "estado": "Consulta y caso registrados exitosamente",
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

      let description = `✅ ¡Su consulta legal y caso han sido registrados exitosamente!\n\n`;
      description += `🔑 Código de consulta: **${consultation_code}**\n`;
      description += `🔑 Código de caso: **${case_code}**\n\n`;
      description += `📋 Detalles de su consulta:\n`;
      description += `• 👤 Nombre del cliente: ${nombre}\n`;
      description += `• 📞 Teléfono: ${numero_contacto}\n`;
      description += `• 📧 Email: ${email}\n`;
      description += `• 📆 Fecha de consulta: ${fecha}\n`;
      description += `• ⏰ Hora de consulta: ${hora}\n\n`;
      description += `📋 Información del caso:\n`;
      description += `• ⚖️ Tipo de caso: ${tipo_caso}\n`;
      description += `• 📝 Resumen: ${resumen_caso}\n`;
      description += `• ${emoji} Urgencia: ${urgencia.toUpperCase()}\n\n`;
      description += `Modalidad: Videollamada legal\n`;
      description += `📞 Teléfono del bufete: (+52) 55-3141-1891\n`;
      description += `🕐 Horarios de atención: Lunes-Viernes 9:00-18:00\nFines de semana únicamente para asuntos urgentes y bajo confirmación expresa.\n\n`;
      description += `💼 Documentación requerida: Favor traer identificación y cualquier documento relevante a su caso.\n\n`;

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
      description += `• ${emoji} Urgencia: ${urgencia.toUpperCase()}\n\n`;
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
    }
  };

  const description = `✅ Servidor en funcionamiento\n\n` +
    `🖥️ Estado: OK\n` +
    `⏰ Timestamp: ${rawData.timestamp}\n\n` +
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
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

// Export app for testing purposes
module.exports = app;