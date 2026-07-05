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

import glob

# 学習（特訓）のルール設定
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=20,          # 教科書を20周読み込ませる
    per_device_train_batch_size=2, # 一度に2行ずつ学習
    logging_steps=2,               # 2ステップごとに進捗を表示
    learning_rate=5e-5,            # 学習のスピード
    use_cpu=True,                  # 安全のためCPUで実行（GPUがある場合は高速化可能）
    save_strategy="steps",         # 途中セーブのタイミング設定
    save_steps=5,                  # 5ステップごとにセーブする
    save_total_limit=2,            # 古いセーブデータは最新の2つまで残す
)

from transformers import TrainerCallback

class SaveAlertCallback(TrainerCallback):
    def on_step_end(self, args, state, control, **kwargs):
        # 次のステップがセーブのタイミングなら警告を出す
        if state.global_step > 0 and state.global_step % args.save_steps == 0:
            print("\n" + "="*50)
            print("🚨 【警告】これからセーブを開始します！")
            print("🚨 破損を防ぐため、絶対に中断（Ctrl+C）しないでください！")
            print("="*50 + "\n")

    def on_save(self, args, state, control, **kwargs):
        print("\n" + "="*50)
        print("✅ 【完了】セーブが終わりました。")
        print("✅ これで中断（Ctrl+C）しても安全です！")
        print("="*50 + "\n")

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets,
    data_collator=data_collator,
    callbacks=[SaveAlertCallback()], # アラート機能を組み込む
)

# 途中のセーブデータがあるかチェック
checkpoints = glob.glob("./results/checkpoint-*")
resume_ckpt = True if len(checkpoints) > 0 else None

print("見習いAIの猛特訓（ファインチューニング）を開始します！...")
if resume_ckpt:
    print("途中のセーブデータを発見しました！続きから再開します...")
    trainer.train(resume_from_checkpoint=True)
else:
    print("最初から特訓を開始します...")
    trainer.train()

print("特訓が完了しました！賢くなったモデルを保存します...")
os.makedirs("./custom_diet_model", exist_ok=True)
model.save_pretrained("./custom_diet_model")
tokenizer.save_pretrained("./custom_diet_model")
print("保存完了: ./custom_diet_model")
