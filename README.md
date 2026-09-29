# KERNOVA

<p align="center">
  <img src="assets/icons/icon.png" alt="KERNOVA Logo" width="128" height="128" />
</p>

<h3 align="center">Offline AI Code Editor</h3>

<p align="center">
  <em>&ldquo;Code locally. Think intelligently.&rdquo;</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20Windows-8B5CF6?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Offline%20First-10B981?style=flat-square" alt="Offline First" />
  <img src="https://img.shields.io/badge/Telemetry-Zero%20Tracking-22D3EE?style=flat-square" alt="Zero Telemetry" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="https://github.com/subhradeepkundu270305/kernova/releases/latest">
    <img src="https://img.shields.io/github/v/release/subhradeepkundu270305/kernova?label=Latest%20Release&color=8B5CF6&style=for-the-badge" alt="Latest Release" />
  </a>
</p>

### 📥 1-Click Downloads (v0.2.0)

| OS | Format | Download | Quick Start |
| :--- | :--- | :--- | :--- |
| 🐧 **Linux** | **AppImage** (Universal) | [**KERNOVA-0.2.0.AppImage**](https://github.com/subhradeepkundu270305/kernova/releases/download/v0.2.0/KERNOVA-0.2.0.AppImage) | `chmod +x KERNOVA-0.2.0.AppImage && ./KERNOVA-0.2.0.AppImage` |
| 🐧 **Linux** | **Debian / Ubuntu / Zorin** | [**kernova_0.2.0_amd64.deb**](https://github.com/subhradeepkundu270305/kernova/releases/download/v0.2.0/kernova_0.2.0_amd64.deb) | `sudo dpkg -i kernova_0.2.0_amd64.deb` |
| 🪟 **Windows** | **Windows 10 / 11 (64-bit)** | [**KERNOVA-0.2.0-windows-x64.zip**](https://github.com/subhradeepkundu270305/kernova/releases/download/v0.2.0/KERNOVA-0.2.0-windows-x64.zip) | Unzip & double-click `KERNOVA.exe` |

---

## ⚡ Overview

**KERNOVA** is a blazing-fast, offline-first desktop code editor tailored for developers, students, and engineers who demand absolute privacy, responsive performance, and intelligent code assistance without cloud lock-in.

Combining the simplicity and snappiness of classic editors like **gedit** with a futuristic **dark glassmorphic 3D aesthetic**, KERNOVA integrates state-of-the-art local Large Language Models (LLMs) via **Ollama** directly into your editing workflow.

Whether you're coding on a plane, practicing Data Structures & Algorithms (DSA), or developing sensitive intellectual property, **KERNOVA never forces your code into external servers**.

---

## ✨ Key Features

### 🧠 1. Local AI Intelligence (Powered by Ollama)
- **100% Offline Inference**: Connects directly to local Ollama instances (`http://localhost:11434`) with zero telemetry and zero mandatory accounts.
- **Hardware-Aware Model Wizard**: Analyzes your machine's physical RAM and recommends the optimal model from the `Qwen2.5-Coder` family:
  - `qwen2.5-coder:0.5b` (For resource-constrained devices / <4 GB RAM)
  - `qwen2.5-coder:1.5b` (Recommended sweet spot for 8 GB RAM systems)
  - `qwen2.5-coder:3b` / `7b` (For 12 GB – 16 GB RAM)
  - `qwen2.5-coder:14b` (For 32 GB+ workstation hardware)
- **One-Click In-App Model Pull**: Download, switch, and delete models directly inside the editor with real-time streaming progress bars.
- **Context-Aware Chat**: Converse with your codebase (`Ctrl+Shift+I`) with automatic file context injection, streaming markdown responses, and one-click code insertion.

### 🌐 2. Cloud AI & Smart Routing (BYOK)
- **Bring Your Own Key (BYOK)**: Optional zero-cost cloud providers for heavy tasks:
  - **Google Gemini 2.0 Flash** (Fast & comprehensive)
  - **Groq** (Ultra-low latency Llama-3 / Mixtral)
  - **OpenRouter** (Universal model gateway)
- **Hardware-Level Encryption**: Cloud API keys are securely stored in the OS Keychain using Electron's `safeStorage` API.
- **Strict Privacy Switch**: A single master toggle — *"Local AI only, never send my code to the cloud"* — ensures cloud endpoints are completely severed.
- **Smart Router**: Auto-selects cloud when online and fallbacks to Ollama seamlessly when offline.

### 💻 3. Full-Fledged Engineering Workspace
- **Offline Monaco Editor**: The battle-tested engine powering VS Code, pre-bundled with offline language grammar, syntax highlighting, and 6 custom themes (*Midnight*, *Aurora*, *Ember*, *Cyberpunk*, *Solaris*, *Abyss*), plus 7 selectable monospace font styles (*JetBrains Mono*, *Fira Code*, *Cascadia Code*, *Source Code Pro*, *Geist Mono*, *Inconsolata*, *Ubuntu Mono*).
- **Filesystem Tree & CRUD**: Fast directory browsing, file/folder creation, rename, delete, duplicate, and system file-manager integration.
- **Tabbed Multi-File Editing**: Fast tab switching, unsaved change indicators, close-confirmation guards, and drag-and-drop reordering.
- **Autosave by Default**: Background debounce saving (default 1000ms) with zero file-loss guarantee.
- **Integrated Terminal Panel (`Ctrl+\``)**: Hardware-accelerated terminal powered by `@xterm/xterm` and `node-pty`, with multi-tab support and responsive resize handles.
- **One-Click File Runner (`F5`)**: Instantly execute Python, C/C++, JavaScript, TypeScript, Go, Rust, Java, and Shell scripts in the integrated terminal.
- **Split Editor View (`Ctrl+\`)**: Edit and compare code side-by-side.
- **Project Search (`Ctrl+Shift+F`)**: High-speed multi-file search across your entire workspace.
- **Command Palette & Quick Open (`Ctrl+Shift+P` / `Ctrl+P`)**: Navigate files and trigger any editor action with keyboard speed.
- **Git Status Bar**: Live Git branch detection, line/column tracking, encoding (UTF-8), and real-time offline status indicator.

### 🪄 4. AI-Powered Workflow Accelerators
- **Inline Ghost-Text Completions**: Debounced suggestions that appear as you write. Press `Tab` to accept or `Esc` to dismiss.
- **Context Selection Actions**: Highlight any code snippet to immediately:
  - 📖 **Explain Code**
  - 🐛 **Find & Fix Bugs**
  - ♻️ **Refactor & Modernize**
  - 📝 **Generate JSDoc / Comments**
  - 🧪 **Write Unit Tests**
  - ⚡ **Analyze Time & Space Complexity (DSA)**
- **Side-by-Side Diff Preview**: Review AI suggestions in a Monaco `DiffEditor` before applying changes with *Accept & Replace* or *Reject*.
- **Natural Language Scaffolding**: Prompt KERNOVA to generate complete project structures with directory trees and starter boilerplate in one click.

### 🌌 5. Aesthetic & Distraction-Free UI
- **Interactive 3D Particle Canvas**: Smooth Three.js ambient background on the Welcome Screen with low-overhead particle physics and mouse parallax.
- **Focus Mode (`Ctrl+Shift+F11`)**: Instantly collapse sidebars, status bars, and panels for an uncluttered zen-coding experience.
- **Performance Friendly**: Respects the `reduceEffects` setting to conserve battery and CPU cycles on laptops and 8 GB RAM machines.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl+P` | Quick File Open |
| `Ctrl+Shift+P` | Command Palette |
| `F5` | Run Active File in Terminal |
| `Ctrl+S` | Save Active File |
| `Ctrl+\`` | Toggle Integrated Terminal |
| `Ctrl+\` | Toggle Split Editor |
| `Ctrl+B` | Toggle File Explorer Sidebar |
| `Ctrl+Shift+F` | Find across Project |
| `Ctrl+Shift+I` | Toggle AI Assistant Chat |
| `Ctrl+Shift+F11` | Toggle Focus Mode |
| `Tab` | Accept Inline AI Completion |
| `Esc` | Dismiss Completion / Modals |

---

## 🖥️ System & Hardware Requirements

| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| **Operating System** | Linux (Ubuntu, Zorin, Debian, Fedora, Arch) / Windows 10/11 64-bit | Linux or Windows 11 64-bit |
| **RAM** | 4 GB (without local models) / 8 GB (for Qwen 1.5B) | 16 GB+ (for Qwen 7B/14B) |
| **CPU** | Intel Core i3 / AMD Ryzen 3 (4 cores) | Intel Core i5/i7 or AMD Ryzen 5/7 (6+ cores) |
| **Disk Space** | 300 MB (Editor only) | 5 GB+ (to store Ollama models) |
| **GPU** | Integrated Intel/AMD graphics | Dedicated NVIDIA GPU with CUDA (optional) |

---

## 🚀 Getting Started

### 1. Download & Install

#### Linux (AppImage & .deb)
```bash
# AppImage
chmod +x KERNOVA-0.2.0.AppImage
./KERNOVA-0.2.0.AppImage

# Debian / Ubuntu / Zorin OS (.deb)
sudo dpkg -i kernova_0.2.0_amd64.deb
```

#### Windows (.zip)
Download and unzip `KERNOVA-0.2.0-windows-x64.zip`, then double-click `KERNOVA.exe` to run.

---

### 2. Setting Up Local Offline AI (Ollama)

1. Install [Ollama](https://ollama.com):
   - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`
   - **Windows**: Download from [ollama.com/download/windows](https://ollama.com/download/windows)
2. Start Ollama:
   ```bash
   ollama serve
   ```
3. In KERNOVA, click **"Setup Offline AI"** on the Welcome screen or press `Ctrl+Shift+I` to pull `qwen2.5-coder:1.5b` with one click!

---

## 🛠️ Development Setup

If you want to contribute or build KERNOVA from source:

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x
- Build tools: `g++`, `make`, `python3` (for `node-pty`)

### Setup Instructions
```bash
# Clone the repository
git clone https://github.com/subhradeepkundu270305/kernova.git
cd kernova

# Install dependencies
pnpm install

# Approve native builds for node-pty
pnpm approve-builds node-pty

# Start development server
pnpm dev

# Build for production
pnpm build

# Package distributions
pnpm package:linux   # Builds .AppImage and .deb into dist/
pnpm package:win     # Builds .exe into dist/
```

---

## 🔒 Privacy & Architecture Principles

1. **Zero Mandatory Telemetry**: KERNOVA does not report home, does not collect analytics, and contains no tracking SDKs.
2. **Local-First IPC**: All filesystem operations, terminal PTY processes, and Ollama calls run directly on your loopback network (`127.0.0.1`).
3. **OS Safe Storage**: Any optional cloud API keys provided by the user are stored in the host operating system's native keychain (libsecret / DPAPI).
4. **Offline Resilience**: Full editor functionality, syntax highlighting, and AI code generation function without an active internet connection.

---

## 📄 License

KERNOVA is licensed under the [MIT License](LICENSE).
Code locally. Think intelligently.
