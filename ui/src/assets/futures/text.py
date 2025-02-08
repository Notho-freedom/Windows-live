import os
import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from datasets import Dataset
from torch.utils.data import DataLoader, Dataset as TorchDataset

# Définir l'appareil (GPU ou CPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Fonction de nettoyage des textes
def clean_text(text):
    return str(text).strip().lower().replace("\n", " ").replace("\r", "")

# Chargement des données
def load_and_prepare_data():
    import pandas as pd
    try:
        articles = pd.read_csv('./articles.csv', sep=';', on_bad_lines='skip').fillna("")
        categories = pd.read_csv('./categories.csv', sep=';', on_bad_lines='skip').fillna("")
        boutiques = pd.read_csv('./boutiques_categories.csv', sep=';', on_bad_lines='skip').fillna("")

        # Renommer et nettoyer les colonnes
        articles = articles.rename(columns={"Articles": "input_text", "Description": "target_text"})
        categories = categories.rename(columns={"Catégorie": "input_text", "Articles": "target_text"})
        boutiques = boutiques.rename(columns={"nom_boutique": "input_text", "Catégories": "target_text"})

        for df in [articles, categories, boutiques]:
            df["input_text"] = df["input_text"].apply(clean_text)
            df["target_text"] = df["target_text"].apply(clean_text)

        combined = pd.concat([articles, categories, boutiques], ignore_index=True)
        return combined[["input_text", "target_text"]].dropna()
    except Exception as e:
        print(f"Erreur lors du chargement des fichiers CSV : {e}")
        exit(1)

# Préparation des données
df = load_and_prepare_data()
dataset = Dataset.from_pandas(df)

# Chargement du modèle et du tokenizer
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
tokenizer.pad_token = tokenizer.eos_token
model = GPT2LMHeadModel.from_pretrained("gpt2").to(device)
model.resize_token_embeddings(len(tokenizer))

# Tokenisation
def tokenize_function(examples):
    return tokenizer(examples["input_text"], truncation=True, padding="max_length", max_length=512)

tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Entraînement
train_test_split = tokenized_dataset.train_test_split(test_size=0.2)
train_dataset = train_test_split["train"]
test_dataset = train_test_split["test"]

class CustomDataset(TorchDataset):
    def __init__(self, dataset):
        self.dataset = dataset

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        item = self.dataset[idx]
        return {
            "input_ids": torch.tensor(item["input_ids"], dtype=torch.long),
            "attention_mask": torch.tensor(item["attention_mask"], dtype=torch.long),
            "labels": torch.tensor(item["input_ids"], dtype=torch.long),
        }

train_loader = DataLoader(CustomDataset(train_dataset), batch_size=2, shuffle=True)

# Optimisation
optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)
eepochs = 1
max_iterations_per_epoch = 5

for epoch in range(epochs):
    model.train()
    print(f"\nÉpoque {epoch + 1}")
    for iteration, batch in enumerate(train_dataloader):
        if iteration >= max_iterations_per_epoch:
            break
        optimizer.zero_grad()
        batch = {k: v.to(device) for k, v in batch.items()}
        outputs = model(input_ids=batch['input_ids'], attention_mask=batch['attention_mask'], labels=batch['labels'])
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        print(f"Perte : {loss.item()}")

# Sauvegarde du modèle
model.save_pretrained("./fine_tuned_model")
tokenizer.save_pretrained("./fine_tuned_model")

# Génération de réponse
def generate_response(question, max_length=50):
    inputs = tokenizer(question, return_tensors="pt", padding=True, truncation=True).to(device)
    outputs = model.generate(
        inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_length=max_length,
        temperature=0.7,
        top_p=0.9,
        no_repeat_ngram_size=2,
        pad_token_id=tokenizer.pad_token_id,
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# Interaction utilisateur
def interactive_chat():
    print("Bienvenue ! Tapez 'exit' pour quitter.")
    while True:
        question = input("Entrez une question : ").strip()
        if question.lower() == "exit":
            print("Au revoir !")
            break
        response = generate_response(question)
        print(f"Réponse : {response}")

if __name__ == "__main__":
    interactive_chat()
