import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments, DataCollatorForLanguageModeling
import os

model_name = "cyberagent/open-calm-small"
print("ベースモデルとトークナイザーを読み込んでいます...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

print("教科書（学習データ）を読み込んでいます...")
dataset = load_dataset('json', data_files='diet_dataset.jsonl', split='train')

def tokenize_function(examples):
    # テキストをAIが理解できる数値（トークン）に変換
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# 言語モデル用のデータ整形ツール（正解ラベルを自動生成）
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

# 学習（特訓）のルール設定
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=20,          # 教科書を20周読み込ませる
    per_device_train_batch_size=2, # 一度に2行ずつ学習
    logging_steps=2,               # 2ステップごとに進捗を表示
    learning_rate=5e-5,            # 学習のスピード
    use_cpu=True,                  # 安全のためCPUで実行（GPUがある場合は高速化可能）
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets,
    data_collator=data_collator,
)

print("見習いAIの猛特訓（ファインチューニング）を開始します！...")
trainer.train()

print("特訓が完了しました！賢くなったモデルを保存します...")
os.makedirs("./custom_diet_model", exist_ok=True)
model.save_pretrained("./custom_diet_model")
tokenizer.save_pretrained("./custom_diet_model")
print("保存完了: ./custom_diet_model")
