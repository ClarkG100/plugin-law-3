//import express library
const express = require('express');

//create an instance of express
const app = express();
//port on which the server will run
const PORT = 3000;

app.use(express.json());

app.post('plugin-law', async (req, res) => {
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

    console.log("Nombre: ", nombre);
    console.log("Número de contacto: ", numero_contacto);
    console.log("Email: ", email);
    console.log("Fecha: ", fecha);
    console.log("Hora: ", hora);

    const num_registros = await obtenerNumeroFilas();
    const appointment_code = `CRDYNA${num_registros}`;

    // Create new row in sheets (adjust column order according to your spreadsheet)
    const row_data = [
      appointment_code,
      nombre,
      numero_contacto,
      email,
      fecha,
      hora
    ];

    // const response_add_row = await agregarFila(row_data);

    if (response_add_row) {
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
      description += `Por Videollamada`;
      description += `📞 Tel: XX XXXX XXXX\n`;
      description += `🕐 Horarios: Lunes-Viernes 9:00-18:00 • fines de semana únicamente para asuntos urgentes y bajo confirmación expresa.\n\n`;

      res.json({
        raw: rawData,
        type: "markdown",
        desc: description
      });
    } else {
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

      let description = `Ocurrio un error, y no pudimos ajendar la sita\n\n`;
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
      error: "Internal server error"
    });
  }
});

//initialize server with app.listen method, if there are no errors when initializing
//the server then it will print succesfully in the console, if not then print error
app.listen(PORT, (error) => {
    if (!error)
        console.log(`Server running on http://localhost:${PORT}`);
    else
        console.log("Error occurred, server can't start", error);
}
);