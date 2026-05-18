import pc from "picocolors";

export const logger = {
  info: (msg: string) => console.log(pc.cyan("ℹ") + " " + msg),
  success: (msg: string) => console.log(pc.green("✓") + " " + msg),
  warn: (msg: string) => console.log(pc.yellow("⚠") + " " + msg),
  error: (msg: string) => console.error(pc.red("✗") + " " + msg),
  step: (msg: string) => console.log(pc.bold(pc.blue("→")) + " " + msg),
  dim: (msg: string) => console.log(pc.dim(msg)),
  blank: () => console.log(),
  header: (msg: string) => {
    console.log();
    console.log(pc.bold(pc.white(msg)));
    console.log(pc.dim("─".repeat(Math.min(msg.length + 2, 60))));
  },
  row: (label: string, value: string, ok?: boolean) => {
    const icon =
      ok === true ? pc.green("✓") : ok === false ? pc.red("✗") : pc.dim("·");
    const paddedLabel = label.padEnd(28);
    console.log(`  ${icon} ${pc.dim(paddedLabel)} ${value}`);
  },
};
