import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';

const agentBrowserBin = process.env.AGENT_BROWSER_BIN || (process.platform === 'win32' ? 'agent-browser.cmd' : 'agent-browser');
const profilePath = process.env.AGENT_BROWSER_PROFILE || 'C:/Users/Oshiogwe Ugbodaga/.gemini/antigravity-browser-profile';
const cdpPort = Number(process.env.AGENT_BROWSER_CDP_PORT || 9222);
const targetUrl = process.env.GITHUB_TARGET_URL || 'https://github.com/dashboard';
const screenshotPath =
  process.env.GITHUB_SCREENSHOT_PATH ||
  'C:/Users/Oshiogwe Ugbodaga/OneDrive/Documents/Coding stuff/Fitness Tracker V1/github-home.png';

const chromeBin =
  process.env.CHROME_BIN ||
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome');

function run(commandParts, capture = true) {
  const command = commandParts
    .map((arg) => `"${String(arg).replaceAll('"', '\\"')}"`)
    .join(' ');

  return execSync(command, {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: true,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPort(port, timeoutMs = 20000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const isOpen = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1200);
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => resolve(false));
      socket.once('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, '127.0.0.1');
    });

    if (isOpen) return;
    await sleep(300);
  }

  throw new Error(`CDP port ${port} did not open within ${timeoutMs}ms.`);
}

if (!fs.existsSync(profilePath)) {
  throw new Error(`Browser profile path not found: ${profilePath}`);
}

if (!fs.existsSync(chromeBin)) {
  throw new Error(`Chrome binary not found: ${chromeBin}`);
}

let snapshot = '';
let launchedChrome;

try {
  launchedChrome = spawn(
    chromeBin,
    [
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profilePath}`,
      '--profile-directory=Default',
      '--no-first-run',
      '--no-default-browser-check',
      targetUrl,
    ],
    { stdio: 'ignore', windowsHide: false },
  );

  await waitForPort(cdpPort);

  run([agentBrowserBin, 'connect', String(cdpPort)]);
  run([agentBrowserBin, 'open', targetUrl]);
  snapshot = run([agentBrowserBin, 'snapshot', '-i']);

  const loggedOut = /\blink\s+"Sign in"/i.test(snapshot);
  const authenticatedIndicators =
    /\bDashboard\b/i.test(snapshot) || /View profile and more/i.test(snapshot) || /Top repositories/i.test(snapshot);

  if (loggedOut || !authenticatedIndicators) {
    throw new Error(
      'Profile verification failed: GitHub session is not authenticated in this Chrome profile. Aborting screenshot.',
    );
  }

  run([agentBrowserBin, 'screenshot', '--full', screenshotPath], false);
  console.log(`Verified profile and saved screenshot: ${screenshotPath}`);
} finally {
  try {
    run([agentBrowserBin, 'close']);
  } catch {
    // no-op
  }

  if (launchedChrome && !launchedChrome.killed) {
    launchedChrome.kill();
  }
}
