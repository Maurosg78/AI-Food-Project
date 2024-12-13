const PDFDocument = require('pdfkit');
const fs = require('fs');
const { createCanvas } = require('canvas'); // Para generar gráficos

function generateReport(data, outputPath) {
    const doc = new PDFDocument({ margin: 50 });
    const canvas = createCanvas(500, 300); // Configuración para gráficos

    // Guardar el PDF
    doc.pipe(fs.createWriteStream(outputPath));

    // Portada
    doc.fontSize(24).text('Informe Técnico Nutricional', { align: 'center' });
    doc.fontSize(14).text(`Producto Analizado: ${data.productName || 'N/A'}`, { align: 'center' });
    doc.text(`Código de Barras: ${data.barcode || 'N/A'}`, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Sección 1: Resumen Ejecutivo
    doc.fontSize(16).text('1. Resumen Ejecutivo', { underline: true });
    doc.fontSize(12).text('Este informe analiza el producto seleccionado y propone alternativas plant-based para replicar sus características nutricionales y organolépticas.');
    doc.moveDown(1);

    // Sección 2: Información del Producto
    doc.fontSize(16).text('2. Información del Producto', { underline: true });
    doc.fontSize(12).text(`Nombre del Producto: ${data.productName || 'N/A'}`);
    doc.text(`Código de Barras: ${data.barcode || 'N/A'}`);
    doc.text('Valores Nutricionales:');
    const nutrition = data.nutrition || {};
    Object.keys(nutrition).forEach(key => {
        doc.text(`${key}: ${nutrition[key]}`);
    });
    doc.moveDown(1);

    // Sección 3: Alternativas Plant-Based
    doc.fontSize(16).text('3. Alternativas Plant-Based', { underline: true });
    if (data.alternatives && data.alternatives.length > 0) {
        data.alternatives.forEach((alt, index) => {
            doc.fontSize(12).text(`${index + 1}. ${alt.name}`);
            doc.text(`Detalles Nutricionales: ${alt.nutritionDetails || 'N/A'}`);
            doc.moveDown(0.5);
        });
    } else {
        doc.text('No se encontraron alternativas sugeridas.');
    }
    doc.moveDown(1);

    // Sección 4: Gráficos Comparativos
    doc.fontSize(16).text('4. Gráficos Comparativos', { underline: true });
    const context = canvas.getContext('2d');
    context.fillStyle = '#FF5733';
    context.fillRect(50, 50, 200, 100); // Ejemplo simple de gráfico
    const image = canvas.toBuffer('image/png');
    doc.image(image, { width: 400, height: 200 });

    // Sección 5: Recomendaciones
    doc.fontSize(16).text('5. Recomendaciones', { underline: true });
    doc.fontSize(12).text('Se sugiere evaluar las alternativas seleccionadas en laboratorio para confirmar su viabilidad.');
    doc.moveDown(2);

    // Finalizar el documento
    doc.end();
    console.log(`Informe generado en: ${outputPath}`);
}

module.exports = generateReport;

