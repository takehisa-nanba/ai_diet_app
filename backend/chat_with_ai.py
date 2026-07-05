import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

print("特訓済みのAIコーチを呼び出しています...（数秒お待ちください）")
model_dir = "./ai_training/custom_diet_model"

# 私たちが特訓した専用モデルを読み込む
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModelForCausalLM.from_pretrained(model_dir)

print("\n" + "="*50)
print("✨ パーソナルAIコーチの準備が完了しました！ ✨")
print("（※終了するには '終了' または 'quit' と入力してください）")
print("="*50 + "\n")

while True:
    user_input = input("あなた: ")
    if user_input in ["終了", "quit"]:
        print("AIコーチ: お疲れ様でした！またいつでも相談してくださいね！")
        break
    if not user_input.strip():
        continue
    
    # AIに渡す会話の形式（教科書と同じフォーマット）
    prompt = f"ユーザー: {user_input}\nAIコーチ:"
    inputs = tokenizer(prompt, return_tensors="pt")
    
    # AIにアドバイスを考えさせる（柔軟性を持たせるための設定）
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=True,          # 必須：これを入れないとtemperatureやtop_pが無視されてしまいます
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
    
    # AIの脳内言語を日本語テキストに変換
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # 自分の質問部分（prompt）を切り取って、AIの返答だけを取り出す
    reply = response[len(prompt):].strip()
    
    # もしAIが勝手に次の「ユーザーの質問」まで先読みして生成してしまったら、そこでカットする
    if "\nユーザー:" in reply:
        reply = reply.split("\nユーザー:")[0].strip()
    if "\n" in reply: # 単純な1問1答にするため、改行以降はカットする安全装置
        reply = reply.split("\n")[0].strip()
        
    print(f"AIコーチ: {reply}\n")
