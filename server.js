const express = require('express');

const app = express();

const PORT = 3000;

app.use(express.json());

// Placeholder function to get row count - replace with your actual implementation
const obtenerNumeroFilas = async () => {
  try {
    // This is a placeholder - implement your actual logic here
    // For example: Google Sheets API, database query, etc.
    console.log("Getting row count...");
    // Return a mock value for demonstration
    return Math.floor(Math.random() * 1000) + 1;
  } catch (error) {
    console.error("Error getting row count:", error);
    throw error;
  }
};

// Placeholder function to add a row - replace with your actual implementation
const agregarFila = async (rowData) => {
  try {
    // This is a placeholder - implement your actual logic here
    // For example: Google Sheets API, database insert, etc.
    console.log("Adding row with data:", rowData);
    
    // Simulate successful operation (80% success rate for demo)
    const success = Math.random() > 0.2;
    
    if (success) {
      console.log("Row added successfully");
      return true;
    } else {
      console.log("Failed to add row");
      return false;
    }
  } catch (error) {
    console.error("Error adding row:", error);
    return false;
  }
};

// Route to handle appointment creation
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
    console.log("Received appointment data:");
    console.log("Nombre: ", nombre);
    console.log("Número de contacto: ", numero_contacto);
    console.log("Email: ", email);
    console.log("Fecha: ", fecha);
    console.log("Hora: ", hora);

    // Get row count and generate appointment code
    const num_registros = await obtenerNumeroFilas();
    const appointment_code = `CRDYNA${num_registros}`;

    // Create new row data
    const row_data = [
      appointment_code,
      nombre,
      numero_contacto,
      email,
      fecha,
      hora
    ];

    // Add row to database/sheets
    const response_add_row = await agregarFila(row_data);

    if (response_add_row) {
      // Success response
      const rawData = {
        "estado_reservacion": "Generada exitosamente",
        "codigo_reservacion": appointment_code,
        "datos_reserva": {
          "nombre": nombre,
          "email": email,
          "telefono": numero_contacto,
          "fecha": fecha,
          "hora": hora
        }
      };

      let description = `📅 ¡Su reservación ha sido generada exitosamente!\n\n`;
      description += `🔑 Código de reservación: **${appointment_code}**\n\n`;
      description += `📋 Detalles de su reservación:\n`;
      description += `• 👤 Nombre: ${nombre}\n`;
      description += `• 📞 Teléfono: ${numero_contacto}\n`;
      description += `• 📧 Email: ${email}\n`;
      description += `• 📆 Fecha: ${fecha}\n`;
      description += `• ⏰ Hora: ${hora}\n\n`;
      description += `Por Videollamada\n`;
      description += `📞 Tel: XX XXXX XXXX\n`;
      description += `🕐 Horarios: Lunes-Viernes 9:00-18:00 • fines de semana únicamente para asuntos urgentes y bajo confirmación expresa.\n\n`;

      res.json({
        raw: rawData,
        type: "markdown",
        desc: description
      });
    } else {
      // Failure response
      const rawData = {
        "estado_reservacion": "No se pudo generar",
        "codigo_reservacion": appointment_code,
        "datos_reserva": {
          "nombre": nombre,
          "email": email,
          "telefono": numero_contacto,
          "fecha": fecha,
          "hora": hora
        }
      };

      let description = `Ocurrió un error, y no pudimos agendar la cita\n\n`;
      description += `🔑 Código de intento: **${appointment_code}**\n\n`;
      description += `📋 Detalles que intentó registrar:\n`;
      description += `• 👤 Nombre: ${nombre}\n`;
      description += `• 📞 Teléfono: ${numero_contacto}\n`;
      description += `• 📧 Email: ${email}\n`;
      description += `• 📆 Fecha: ${fecha}\n`;
      description += `• ⏰ Hora: ${hora}\n\n`;
      description += `Por favor, intente nuevamente 🙏 \n\n`;

      res.json({
        raw: rawData,
        type: "markdown",
        desc: description
      });
    }
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Endpoint: POST http://localhost:${PORT}/plugin-law`);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

// Export app for testing purposes
