from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

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
model_name = "cyberagent/open-calm-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto", torch_dtype="auto")
print("AIモデルの読み込み完了！")

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

    # 【Few-Shotプロンプト】AIに「答え方の例」を見せて学習させる
    prompt = f"""以下はダイエットコーチとユーザーの会話です。コーチはユーザーの情報に基づいて、ムリなく痩せるための優しいアドバイスを返します。

ユーザー情報: 体重105kg 目標90kg
ユーザー: 今の体重はいくつだっけ？
コーチ: 今の体重は105kgですね！目標の90kgに向けて、無理せず健康的に頑張りましょう！

ユーザー情報: {user_info.strip()}
ユーザー: {request.message}
コーチ:"""
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        tokens = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.3,            # ★AIの創造性を下げて、事実（プロンプト）に忠実に答えるように変更
            top_p=0.9,
            repetition_penalty=1.5,     # 同じ単語の繰り返しを強く抑制
            no_repeat_ngram_size=2,     # 全く同じフレーズの連続を禁止
            pad_token_id=tokenizer.pad_token_id,
        )
    
    output_text = tokenizer.decode(tokens[0], skip_special_tokens=True)
    reply = output_text.replace(prompt, "").strip()
    
    # AIが永遠に話し続けないように、改行までの「最初の1文（ブロック）」だけを切り出す
    reply = reply.split('\n')[0].strip()
    
    if not reply:
        reply = "（うまく言葉が紡げませんでした…もう一度お願いします！）"
        
    return {"reply": reply}
