# ResearchMind — Local NLP Research Analysis Pipeline

ResearchMind is an open-source, local NLP system that analyzes corpora of research papers to surface insights beyond standard RAG:
1. **Method × Dataset Gap Matrix:** Detects unexplored method-dataset combinations in the literature.
2. **Pairwise NLI Contradictions:** Grounded claim comparison using DeBERTa CrossEncoders to flag direct scientific contradictions.
3. **Local NLP Extraction:** Combines spaCy linguistic parsing (NER, Noun Chunks) with zero-shot transformer classification without external LLM API dependency.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.9+
- 4GB+ RAM (for local model inference)

### 1. Setup Virtual Environment
```bash
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies & SpaCy Pipeline
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 3. Run the Production Server
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 4. Access the Web Dashboard
Open your browser and navigate to:
👉 **`http://127.0.0.1:8000`**

---

## 📂 Project Structure

```text
ResearchMind/
├── requirements.txt            # Python dependencies
├── README.md                   # Project documentation
├── backend/
│   ├── main.py                 # FastAPI application server & routes
│   ├── nlp_pipeline.py         # spaCy + Transformer local extraction & NLI engine
│   └── sample_corpus.json      # Pre-loaded benchmark corpus (15-paper paper set)
└── frontend/
    ├── index.html              # Modern Dashboard UI
    ├── style.css               # Clean styling & table matrix CSS
    └── app.js                  # Frontend state & API interaction
```

---

## 💡 How to Use
1. **Load Demo Corpus:** Click the **"Load Demo Corpus"** button on the UI to run the benchmark instantly.
2. **Custom Upload:** Upload any `.json` array containing paper abstracts formatted as:
```json
[
  {
    "id": "P1",
    "abstract": "We introduce GraphNet for node classification on the Cora dataset..."
  }
]
```
