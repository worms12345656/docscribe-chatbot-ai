from transformers import VitsModel, AutoTokenizer
import torch
from IPython.display import Audio
import soundfile as sf
import numpy as np


# Step 3: Clone and load the pre-trained TTS model from Hugging Face
# You may replace this with any compatible TTS model
model = VitsModel.from_pretrained("facebook/mms-tts-eng")
tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-eng")

# Step 4: Prepare input text
# text = "Hello everyone, today is the good day of week."  # Example text in Vietnamese

# Step 5: Tokenize the input text


def text_to_speech(text):
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        output = model(**inputs).waveform
        Audio(output.numpy(), rate=model.config.sampling_rate)
        audio_data = output.numpy()
        audio_data = np.squeeze(audio_data)
        sf.write('output.wav', audio_data.T if audio_data.ndim > 1 else audio_data,
                 model.config.sampling_rate)


text_to_speech("bonjour")
