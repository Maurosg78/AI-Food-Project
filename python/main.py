import sys
import json

def process_data(data):
    try:
        # Simula procesamiento simple para pruebas.
        processed_data = {"message": "Datos procesados correctamente", "data": data}
        return processed_data
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    try:
        # Leer datos enviados desde Node.js como argumento.
        input_data = json.loads(sys.argv[1])
        # Procesar datos y devolver el resultado.
        result = process_data(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
