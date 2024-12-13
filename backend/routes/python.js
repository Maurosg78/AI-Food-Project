const { spawn } = require("child_process");

function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [scriptPath, ...args]);

    let output = "";
    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (err) => {
      console.error("Error en el script Python:", err.toString());
      reject(err.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(`El script Python terminó con código ${code}`);
      }
      resolve(output.trim());
    });
  });
}

module.exports = { runPythonScript };
