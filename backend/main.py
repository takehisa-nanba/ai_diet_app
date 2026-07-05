from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from duckduckgo_search import DDGS
import os

app = FastAPI(title="AI Diet Coach API")

# Web（ブラウザ）からAPIを叩くためのCORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("AIモデルを読み込んでいます...（初回はダウンロードに数分かかります）")
# 学習済みのモデルが存在すればそれを使い、なければベースモデルを使用する
model_name = "./custom_diet_model" if os.path.exists("./custom_diet_model") else "cyberagent/open-calm-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto", torch_dtype="auto")
print(f"AIモデル（{model_name}）の読み込み完了！")

# スマホから送られてくるプロフィールデータの型定義
class Profile(BaseModel):
    age: Optional[str] = ""
    height: Optional[str] = ""
    weight: Optional[str] = ""
    targetWeight: Optional[str] = ""
    targetDate: Optional[str] = ""
    activityLevel: Optional[str] = ""

class ChatRequest(BaseModel):
    message: str
    profile: Optional[Profile] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Diet Coach API"}

@app.post("/chat")
def chat(request: ChatRequest):
    # ユーザー情報を文字列にまとめる
    user_info = ""
    if request.profile:
        p = request.profile
        if p.weight: user_info += f"体重{p.weight}kg "
        if p.targetWeight: user_info += f"目標{p.targetWeight}kg "
        if p.activityLevel: user_info += f"活動{p.activityLevel} "
        if p.age: user_info += f"年齢{p.age}歳"
    
    if not user_info.strip():
        user_info = "未設定"

    # RAG: ウェブ検索による最新情報の取得
    user_message = request.message
    search_context = ""
    try:
        # duckduckgoを用いてユーザーの質問に関連する情報をウェブ検索する
        results = DDGS().text(user_message, max_results=2)
        if results:
            search_context = "【ウェブ検索参考情報】: " + " / ".join([res['body'] for res in results])
    except Exception as e:
        print("Web Search Error:", e)

    # 【ハイブリッドプロンプト】基礎知識（学習データ）＋ 最新情報（検索結果）
    prompt = f"""以下はプロのダイエットコーチとユーザーの会話です。コーチは医学的根拠とパーソナルトレーナーの原則に基づいて、相手を肯定しながら無理なく痩せるための最適化されたアドバイスを返します。

{search_context}
ユーザー情報: {user_info.strip()}
ユーザー: {user_message}
コーチ:"""
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        tokens = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.3,
            top_p=0.9,
            repetition_penalty=1.5,
            no_repeat_ngram_size=2,
            pad_token_id=tokenizer.pad_token_id,
        )
    
    output_text = tokenizer.decode(tokens[0], skip_special_tokens=True)
    reply = output_text.replace(prompt, "").strip()
    
    # 改行までの「最初の1文（ブロック）」だけを切り出す
    reply = reply.split('\n')[0].strip()
    
    if not reply:
        reply = "（うまく言葉が紡げませんでした…もう一度お願いします！）"
        
    return {"reply": reply}

class PlanRequest(BaseModel):
    food: str
    profile: Optional[Profile] = None

@app.post("/plan")
def plan(request: PlanRequest):
    user_info = ""
    if request.profile:
        p = request.profile
        if p.weight: user_info += f"体重{p.weight}kg "
        if p.targetWeight: user_info += f"目標{p.targetWeight}kg "
        if p.activityLevel: user_info += f"活動{p.activityLevel} "
        if p.age: user_info += f"年齢{p.age}歳"
    
    if not user_info.strip():
        user_info = "未設定"

    food = request.food
    search_context = ""
    try:
        results = DDGS().text(f"{food} カロリー ダイエット レシピ工夫", max_results=2)
        if results:
            search_context = "【ウェブ検索参考情報】: " + " / ".join([res['body'] for res in results])
    except Exception as e:
        print("Web Search Error:", e)

    prompt = f"""以下はプロのダイエットコーチによる食事提案です。ユーザーは今日どうしても「{food}」を食べたいと考えています。
ダイエット中ですが我慢させず、その食材を組み込んだ1日の献立（朝・昼・夜）や、太りにくい食べ合わせ、調理の工夫を提案してください。

{search_context}
ユーザー情報: {user_info.strip()}
食べたいもの: {food}
提案:"""
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        tokens = model.generate(
            **inputs,
            max_new_tokens=250,
            do_sample=True,
            temperature=0.5,
            top_p=0.9,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.pad_token_id,
        )
    
    output_text = tokenizer.decode(tokens[0], skip_special_tokens=True)
    reply = output_text.replace(prompt, "").strip()
    
    if not reply:
        reply = "（プランの作成に失敗しました。もう少し具体的な食べ物を入力してみてください！）"
        
    return {"plan": reply}
