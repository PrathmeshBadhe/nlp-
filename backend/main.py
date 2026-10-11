from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from nlp_pipeline import analyze_corpus

app = FastAPI(title="ResearchMind Local Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_uploaded_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        corpus_data = json.loads(contents)
        if not isinstance(corpus_data, list):
            raise HTTPException(status_code=400, detail="Corpus JSON must be an array of objects containing 'id' and 'abstract'.")
        
        results = analyze_corpus(corpus_data)
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/sample")
def get_sample_analysis():
    sample_path = os.path.join(os.path.dirname(__file__), 'sample_corpus.json')
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample corpus file not found.")
    
    with open(sample_path, 'r', encoding='utf-8') as f:
        corpus_data = json.load(f)
        
    results = analyze_corpus(corpus_data)
    return {"status": "success", "data": results}

# Serve static frontend UI
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
