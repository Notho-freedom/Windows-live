# -*- coding: latin -*-
import torch
import torch.nn as nn
import torch.optim as optim
from torch.nn.utils.rnn import pad_sequence
from torch.utils.data import DataLoader, Dataset
from sklearn.preprocessing import LabelEncoder
from models import Session, Command
import numpy as np

# Fonction pour vérifier les séquences
def verifier_sequences(sequences):
    sequences_valides = []
    for seq in sequences:
        if isinstance(seq, torch.Tensor):
            if seq.dim() == 1 and seq.size(0) > 0:
                sequences_valides.append(seq)
            else:
                print(f"Sequence invalid: {seq}, Type: {type(seq)}, Dim: {seq.dim()}, Size: {seq.size()}")
        else:
            print(f"Sequence invalid: {seq}, Type: {type(seq)}, Dim: N/A, Size: N/A")
    return sequences_valides

# Lecture des commandes depuis la base de données
session = Session()
commands = session.query(Command).all()
commands = [command.command_text for command in commands]

# Tokenisation des commandes
tokenizer = LabelEncoder()
tokenizer.fit([char for command in commands for char in command])  # Ajuster le tokenizer sur tous les caractères uniques
sequences = [torch.tensor(tokenizer.transform(list(command))) for command in commands]
vocab_size = len(tokenizer.classes_)

# Création des séquences d'entrée et de sortie
input_sequences = []
output_sequences = []
for seq in sequences:
    for i in range(1, len(seq)):
        input_sequences.append(seq[:i])
        output_sequences.append(seq[i])

# Imprimer les séquences avant le filtrage
print("Input sequences before filtering:", input_sequences)
print("Output sequences before filtering:", output_sequences)

# Vérification des séquences
input_sequences = verifier_sequences(input_sequences)
output_sequences = verifier_sequences(output_sequences)

# Imprimer les séquences après le filtrage
print("Input sequences after filtering:", input_sequences)
print("Output sequences after filtering:", output_sequences)

# Vérification supplémentaire pour s'assurer que les séquences ne sont pas vides
if not input_sequences or not output_sequences:
    raise ValueError("Les séquences d'entrée ou de sortie sont vides après le filtrage.")

# Padding des séquences
input_sequences = pad_sequence(input_sequences, batch_first=True, padding_value=0)
output_sequences = pad_sequence(output_sequences, batch_first=True, padding_value=0)

# Définition du modèle
class CommandPredictor(nn.Module):
    def __init__(self, vocab_size, embed_size, hidden_size):
        super(CommandPredictor, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embed_size)
        self.lstm = nn.LSTM(embed_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, vocab_size)

    def forward(self, x):
        x = self.embedding(x)
        x, _ = self.lstm(x)
        x = self.fc(x[:, -1, :])
        return x

model = CommandPredictor(vocab_size, embed_size=64, hidden_size=64)

# Compilation du modèle
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Entraînement du modèle
num_epochs = 100
for epoch in range(num_epochs):
    for i in range(len(input_sequences)):
        inputs = input_sequences[i].unsqueeze(0)
        targets = output_sequences[i].unsqueeze(0)

        outputs = model(inputs)
        loss = criterion(outputs, targets)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    if (epoch+1) % 10 == 0:
        print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

# Sauvegarde du modèle
torch.save(model.state_dict(), 'command_prediction_model.pth')

# Sauvegarde du tokenizer
import pickle
with open('tokenizer.pkl', 'wb') as f:
    pickle.dump(tokenizer, f)
