// Grab DOM elements
const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const stagingArea = document.getElementById("stagingArea");
const dropZone = document.getElementById("dropZone");
const sidebar = document.getElementById("sidebar");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const newChatBtn = document.getElementById("newChatBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const exportBtn = document.getElementById("exportBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const historyList = document.getElementById("historyList");
const welcomeScreen = document.getElementById("welcomeScreen");
const toast = document.getElementById("toast");

let stagedFiles = [];
let isFirstMessage = true;
let chatCounter = 0;

// --- Sidebar & Theme ---
menuToggleBtn.addEventListener("click", () => sidebar.classList.add("open"));
closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("open"));

document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("open")) {
        const clickedInsideSidebar = e.target.closest("#sidebar");
        const clickedOnToggleBtn = e.target.closest("#menuToggleBtn");
        
        if (!clickedInsideSidebar && !clickedOnToggleBtn) {
            sidebar.classList.remove("open");
        }
    }
});

themeToggleBtn.addEventListener("click", () => {
    const body = document.body;
    body.dataset.theme = body.dataset.theme === "aurora" ? "" : "aurora";
});

// --- Quick Prompts ---
document.querySelectorAll(".glass-chip").forEach(chip => {
    chip.addEventListener("click", () => {
        const prompt = chip.dataset.prompt;
        if (prompt === "Run Benchmark Demo") {
            loadDemo();
        } else {
            chatInput.value = prompt;
            chatInput.focus();
        }
    });
});

// --- File Handling (Drag/Drop & Input) ---
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drag-over"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    const validFiles = Array.from(files).filter(f => f.name.endsWith('.json') || f.name.endsWith('.txt') || f.name.endsWith('.pdf') || f.name.endsWith('.docx'));
    if (validFiles.length === 0) {
        showToast("Invalid format. Please upload JSON, TXT, PDF, or DOCX files.");
        return;
    }
    
    for (let f of validFiles) {
        if (f.size > 15 * 1024 * 1024) {
            showToast(`${f.name} exceeds 15MB limit.`);
            return;
        }
    }

    stagedFiles = [...stagedFiles, ...validFiles];
    renderStagingArea();
    chatInput.focus();
}

function renderStagingArea() {
    if (stagedFiles.length === 0) {
        stagingArea.classList.add("d-none");
        return;
    }
    stagingArea.classList.remove("d-none");
    stagingArea.innerHTML = stagedFiles.map((f, i) => `
        <div class="file-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            ${f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name} 
            <span style="opacity: 0.5; font-size: 0.7rem;">(${(f.size/1024).toFixed(1)} KB)</span>
            <button onclick="removeFile(${i})">✕</button>
        </div>
    `).join("");
}

window.removeFile = (index) => {
    stagedFiles.splice(index, 1);
    renderStagingArea();
};

// --- Toast ---
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// --- Chat Logic ---
chatInput.addEventListener("input", function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
sendBtn.addEventListener("click", sendMessage);

newChatBtn.addEventListener("click", () => {
    Array.from(chatBox.children).forEach(c => { if(c.id !== "welcomeScreen") c.remove(); });
    welcomeScreen.classList.remove("d-none");
    isFirstMessage = true;
    if(window.innerWidth <= 768) sidebar.classList.remove("open");
});
clearChatBtn.addEventListener("click", () => newChatBtn.click());

exportBtn.addEventListener("click", () => {
    const data = JSON.stringify({ note: "ResearchMind Export", status: "success" });
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "research_export.json";
    a.click();
    showToast("Exported successfully!");
});

function addToHistory(title) {
    chatCounter++;
    const newItem = document.createElement("li");
    newItem.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${title}`;
    historyList.insertBefore(newItem, historyList.firstChild);
}

function appendUserMessage(text, files) {
    if (isFirstMessage) {
        welcomeScreen.classList.add("d-none");
        addToHistory(files.length > 0 ? files[0].name : text.substring(0, 20) || "Session");
        isFirstMessage = false;
    }
    
    let fileHtml = '';
    if (files.length > 0) {
        fileHtml = `<div style="font-size: 0.8rem; opacity: 0.8; margin-bottom: 4px;">📎 Attached ${files.length} file(s)</div>`;
    }
    
    const div = document.createElement("div");
    div.className = "message user";
    div.innerHTML = `
        <div class="avatar user-avatar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div class="msg-bubble">${fileHtml} ${text.replace(/\n/g, '<br/>')}</div>
    `;
    chatBox.appendChild(div);
    scrollToBottom();
}

function appendSystemMessage(htmlContent) {
    const div = document.createElement("div");
    div.className = "message sys";
    div.innerHTML = `
        <div class="avatar sys-avatar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="msg-bubble">${htmlContent}</div>
    `;
    chatBox.appendChild(div);
    scrollToBottom();
    return div;
}

function showTyping() {
    const div = document.createElement("div");
    div.className = "message sys";
    div.id = "typingIndicator";
    div.innerHTML = `
        <div class="avatar sys-avatar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="msg-bubble">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    chatBox.appendChild(div);
    scrollToBottom();
}
function hideTyping() {
    const ind = document.getElementById("typingIndicator");
    if (ind) ind.remove();
}

function scrollToBottom() {
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text && stagedFiles.length === 0) return;
    
    const files = [...stagedFiles];
    appendUserMessage(text, files);
    
    chatInput.value = "";
    chatInput.style.height = 'auto';
    stagedFiles = [];
    renderStagingArea();
    
    showTyping();
    
    // API logic - Fallback to demo or parse JSON
    if (files.length > 0 && files[0].name.endsWith('.json')) {
        try {
            let merged = [];
            for (let f of files) {
                const c = await f.text();
                const j = JSON.parse(c);
                merged = merged.concat(Array.isArray(j) ? j : [j]);
            }
            const blob = new Blob([JSON.stringify(merged)], { type: 'application/json' });
            const fd = new FormData();
            fd.append("file", blob, "corpus.json");
            
            const res = await fetch("/api/analyze", { method: "POST", body: fd });
            const data = await res.json();
            hideTyping();
            handleResponse(data);
        } catch(e) {
            hideTyping();
            appendSystemMessage("Error analyzing files: " + e.message);
        }
    } else if (text.toLowerCase().includes("demo")) {
        hideTyping();
        loadDemo(false);
    } else {
        setTimeout(() => {
            hideTyping();
            appendSystemMessage("Received your query! 🚀<br/><br/>(Please upload a JSON corpus for full analysis, or click 'Run Benchmark Demo')");
        }, 1500);
    }
}

async function loadDemo(sendUserMessage = true) {
    if (sendUserMessage) appendUserMessage("Run Benchmark Demo", []);
    showTyping();
    try {
        const res = await fetch("/api/sample");
        const data = await res.json();
        hideTyping();
        handleResponse(data);
    } catch(e) {
        hideTyping();
        appendSystemMessage("Error connecting to local engine: " + e.message);
    }
}

function handleResponse(res) {
    if (res.status === "error") {
        appendSystemMessage(`<span style="color: #ef4444;">Error: ${res.message}</span>`);
        return;
    }
    
    const data = res.data;
    let html = `
        <div class="result-kpis">
            <div class="kpi-card"><div class="kpi-val">${data.claims.length}</div><div class="kpi-label">Papers</div></div>
            <div class="kpi-card"><div class="kpi-val text-success" style="color:var(--accent-emerald)">${data.claims.length}</div><div class="kpi-label">Claims</div></div>
            <div class="kpi-card"><div class="kpi-val text-danger" style="color:#ef4444">${data.contradictions.length}</div><div class="kpi-label">Conflicts</div></div>
        </div>
        <h4 style="margin-bottom:0.75rem; font-size: 1.05rem;">Coverage Matrix</h4>
        <div style="overflow-x:auto;">
            <table class="matrix-table">
                <thead><tr>${data.matrix.columns.map(c => `<th>${c}</th>`).join("")}</tr></thead>
                <tbody>
                    ${data.matrix.data.map(r => `
                        <tr>
                            ${data.matrix.columns.map((c, i) => {
                                let v = r[c] || "";
                                if (i===0) return `<td><strong>${v}</strong></td>`;
                                if (v.includes("UNEXPLORED")) return `<td><span class="badge-gap">GAP</span></td>`;
                                return `<td><span class="badge-paper">${v}</span></td>`;
                            }).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
    
    appendSystemMessage(html);
}
