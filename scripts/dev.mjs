import { spawn } from "node:child_process";

const apiBaseUrl = "http://127.0.0.1:8001";
const processes = [];

function start(name, command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, VITE_API_BASE_URL: apiBaseUrl },
    stdio: "inherit",
  });

  processes.push(child);

  child.on("exit", (code, signal) => {
    const detail = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.log(`[${name}] exited with ${detail}`);
    shutdown(child);
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start`, error);
    shutdown(child);
  });
}

function shutdown(origin) {
  for (const child of processes) {
    if (child !== origin && !child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

start("backend", "./.venv/bin/python", [
  "-m",
  "uvicorn",
  "backend.app:app",
  "--host",
  "127.0.0.1",
  "--port",
  "8001",
  "--reload",
]);

start("frontend", "npx", ["vite", "--host", "127.0.0.1"]);
