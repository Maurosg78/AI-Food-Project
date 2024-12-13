const { spawn } = require("child_process");

function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [scriptPath, ...args]);

    let output = "";
    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (err) => {
      reject(err.toString());
    });

    pythonProcess.on("close", () => {
      resolve(output);
    });
  });
}

module.exports = { runPythonScript };
