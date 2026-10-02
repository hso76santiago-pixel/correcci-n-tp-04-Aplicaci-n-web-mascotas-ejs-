// Importamos los módulos necesarios para crear un servidor web con Express y trabajar con rutas de archivos
const express = require("express");
const path = require("node:path");
// Importamos las funciones leerJson y escribirJson desde el archivo archivos.js para manejar la lectura y escritura de archivos JSON
const { leerJson, escribirJson} = require("./archivos");
const expressLayouts = require("express-ejs-layouts");
// Definimos el puerto en el que se ejecutará la aplicación y la ruta del archivo JSON que contiene los datos de las mascotas
const PORT = 3000;
const rutaDatos = path.join(__dirname, "..", "datos", "mascotas.json");
// Función principal que inicializa la aplicación
async function main() {
  const mascotas = await leerJson(rutaDatos);
  const app = express();
// Configuramos la aplicación para usar EJS como motor de plantillas y establecer la carpeta de vistas y el layout principal
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.use(expressLayouts);
  app.set("layout", "layouts/main");
  app.use(express.static(path.join(__dirname, "..", "public")));

  // incorporo esta linea para poder recibir datos de formularios en formato x-www-form-urlencoded//
  app.use(express.urlencoded({ extended: false }));
  // Definino las rutas de la aplicación para manejar las solicitudes HTTP y renderizar las vistas correspondientes
  app.get("/api/mascotas", (req, res) => {
    res.json(mascotas);
  });
// Definimos la ruta raíz que renderiza la vista de inicio con el título y la lista de mascotas
  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Mercado de Mascotas", mascotas: mascotas });
  });
// Definimos la ruta para mostrar la lista de mascotas, la ruta para crear una nueva mascota y la ruta para mostrar los detalles de una mascota específica según su ID
  app.get("/mascotas", (req, res) => {
    res.render("mascotas/lista", {
      titulo: "Mascotas",
      mascotas: mascotas,
    });
  });

  app.get("/mascotas/nueva", (req, res) => {
    res.render("mascotas/nueva", {
      titulo: "Nueva mascota",
      error: null,
      valores: {},
    });
  });
// Definimos la ruta para mostrar los detalles de una mascota específica según su ID, y si no se encuentra, renderizamos una vista de error con un mensaje adecuado
  app.get("/mascotas/:id", (req, res) => {
    const id = Number(req.params.id);

    const mascota = mascotas.find((mascota) => mascota.id === id);
    if (!mascota) {
      return res.status(404).render("no-encontrado", {
        titulo: "Mascota no encontrada",
        mensaje: "No existe una mascota con ese identificador.",
      });
    }
    // Si se encuentra la mascota, renderizamos la vista de detalle con la información correspondiente
    res.render("mascotas/detalle", {
      titulo: mascota.nombre,
      mascota,
    });
  });
 
// Ruta para crear una nueva mascota mediante POST
app.post("/mascotas", (req, res) => {
   // 1. Extraer datos incluyendo 'estado'
  const { nombre, especie, edad, descripcion, estado } = req.body;
 // 2. Limpiar cadenas de texto
  const nombreLimpio = String(nombre ?? "").trim();
  const especieLimpia = String(especie ?? "").trim();
  
  const descripcionLimpia = String(descripcion ?? "").trim();
  const estadoLimpio = String(estado ?? "").trim();

  // 3. Convertir y validar edad
  const edadNum = Number(edad);
  
  const edadEsInvalida = edad === "" || isNaN(edadNum) || edadNum < 0;

  // 4. Validar campos obligatorios y edad no negativa
  
  if (!nombreLimpio || !especieLimpia || !descripcionLimpia || !estadoLimpio || edadEsInvalida) {
    return res.status(400).render("mascotas/nueva", {
      titulo: "Nueva mascota",
      error: "Completá todos los campos con valores válidos (la edad debe ser un número mayor o igual a 0).",
      valores: req.body,
    });
  }
    // 5. Calcular el nuevo ID dentro de la función POST
  const ultimoId = mascotas.reduce(
    (mayorId, mascota) => Math.max(mayorId, mascota.id), 0
  );
  const nuevoId = ultimoId + 1;

  // 6. Crear objeto con imagen fija '/img/mascota.svg'
  const nuevaMascota = {
    id: nuevoId,
    nombre: nombreLimpio,
    especie: especieLimpia,
    edad: edadNum,
    descripcion: descripcionLimpia,
    estado: estadoLimpio,
    imagen: "/img/mascota.svg"
  };

  // 7. Guardar SOLO en el arreglo en memoria y redirigir
  mascotas.push(nuevaMascota);
  res.redirect("/mascotas");
});


  app.listen(PORT, () => {
    console.log(`Aplicación disponible en http://localhost:${PORT}`);
  });
}
// llamo a la función main para iniciar la aplicación
main();
