const convertToCSV = (data) => {
    if (!data || !data.length) {
      return "";
    }
  
    // Extraer las claves como encabezados del CSV
    const headers = Object.keys(data[0]).join(",");
  
    // Extraer los valores de cada objeto en el array
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`) // Encerrar valores entre comillas para manejar comas
        .join(",")
    );
  
    // Combinar encabezados y filas en un solo string
    return [headers, ...rows].join("\n");
  };
  
  module.exports = { convertToCSV };
  