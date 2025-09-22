const express = require('express');

const app = express();

const PORT = 3000;

app.use(express.json());

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

// Route to handle legal consultation scheduling
app.post('/plugin-law', async (req, res) => {
  try {
    const {
      nombre,
      numero_contacto,
      email,
      fecha,
      hora
    } = req.body;

    // Validate required fields
    if (!nombre || !numero_contacto || !email || !fecha || !hora) {
      return res.status(400).json({
        error: "Missing required fields: name, phone, email, date, time"
      });
    }

    // Log received data
    console.log("Received consultation data:");
    console.log("Nombre del cliente: ", nombre);
    console.log("Número de contacto: ", numero_contacto);
    console.log("Email: ", email);
    console.log("Fecha de consulta: ", fecha);
    console.log("Hora de consulta: ", hora);

    // Get case count and generate consultation code
    const num_registros = await obtenerNumeroFilas();
    const consultation_code = `LAWCONS${num_registros}`;

    // Create new consultation data
    const row_data = [
      consultation_code,
      nombre,
      numero_contacto,
      email,
      fecha,
      hora
    ];

    // Add consultation to system
    const response_add_row = await agregarFila(row_data);

    if (response_add_row) {
      // Success response
      const rawData = {
        "estado_consulta": "Agendada exitosamente",
        "codigo_consulta": consultation_code,
        "datos_consulta": {
          "nombre_cliente": nombre,
          "email": email,
          "telefono": numero_contacto,
          "fecha_consulta": fecha,
          "hora_consulta": hora
        }
      };

      let description = `⚖️ ¡Su consulta legal ha sido agendada exitosamente!\n\n`;
      description += `🔑 Código de consulta: **${consultation_code}**\n\n`;
      description += `📋 Detalles de su consulta legal:\n`;
      description += `• 👤 Nombre del cliente: ${nombre}\n`;
      description += `• 📞 Teléfono: ${numero_contacto}\n`;
      description += `• 📧 Email: ${email}\n`;
      description += `• 📆 Fecha de consulta: ${fecha}\n`;
      description += `• ⏰ Hora de consulta: ${hora}\n\n`;
      description += `Modalidad: Videollamada legal\n`;
      description += `📞 Teléfono del bufete: +1 (555) 123-4567\n`;
      description += `🕐 Horarios de atención: Lunes-Viernes 9:00-18:00 • Sábados 10:00-14:00 (solo consultas urgentes)\n\n`;
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
        "estado_consulta": "No se pudo agendar",
        "codigo_consulta": consultation_code,
        "datos_consulta": {
          "nombre_cliente": nombre,
          "email": email,
          "telefono": numero_contacto,
          "fecha_consulta": fecha,
          "hora_consulta": hora
        }
      };

      let description = `❌ Ocurrió un error, y no pudimos agendar su consulta legal\n\n`;
      description += `🔑 Código de intento: **${consultation_code}**\n\n`;
      description += `📋 Detalles que intentó registrar:\n`;
      description += `• 👤 Nombre del cliente: ${nombre}\n`;
      description += `• 📞 Teléfono: ${numero_contacto}\n`;
      description += `• 📧 Email: ${email}\n`;
      description += `• 📆 Fecha deseada: ${fecha}\n`;
      description += `• ⏰ Hora deseada: ${hora}\n\n`;
      description += `Por favor, contacte a nuestro departamento de citas al +1 (555) 123-4567 o intente nuevamente. 🙏 \n\n`;

      res.json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    }
  } catch (error) {
    console.error("Error creating legal consultation:", error);
    res.status(500).json({
      error: "Error interno del sistema",
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Legal consultation server is running' });
});

// Initialize server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Legal consultation server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Endpoint: POST http://localhost:${PORT}/plugin-law`);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

// Export app for testing purposes