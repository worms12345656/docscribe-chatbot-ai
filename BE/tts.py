from transformers import VitsModel, AutoTokenizer
import torch
from IPython.display import Audio
import soundfile as sf
import numpy as np
import datetime
import os


# Step 3: Clone and load the pre-trained TTS model from Hugging Face
# You may replace this with any compatible TTS model
model = VitsModel.from_pretrained("facebook/mms-tts-eng")
tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-eng")

# Step 4: Prepare input text
# text = "Hello everyone, today is the good day of week."  # Example text in Vietnamese

# Step 5: Tokenize the input text


def text_to_speech(text):
    try:
        # Generate unique filename with timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
        filename = f"tts_{timestamp}.wav"
        
        # Create audio_files directory if it doesn't exist
        audio_dir = "audio_files"
        if not os.path.exists(audio_dir):
            os.makedirs(audio_dir)
        
        filepath = os.path.join(audio_dir, filename)
        
        # Tokenize the input text
        inputs = tokenizer(text, return_tensors="pt")
        
        # Generate audio
        with torch.no_grad():
            output = model(**inputs).waveform
            audio_data = output.numpy()
            audio_data = np.squeeze(audio_data)
            sf.write(filepath, audio_data.T if audio_data.ndim > 1 else audio_data,
                     model.config.sampling_rate)
        
        return filename
        
    except Exception as e:
        print(f"Error in text_to_speech: {e}")
        raise e


# Test the function if run directly
if __name__ == "__main__":
    text_to_speech("bonjour")
