import { spawnSync } from "node:child_process";
import { platform } from "node:process";

const command = platform === "win32" ? "py" : "python";
const result = spawnSync(command, ["-m", "unittest", "discover", "api/tests"], {
  stdio: "inherit",
  shell: platform === "win32",
});

process.exit(result.status ?? 1);
