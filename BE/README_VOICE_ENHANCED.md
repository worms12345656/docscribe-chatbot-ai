# Voice-Enhanced RAG Classification System

## Overview

This voice-enhanced version of the RAG (Retrieval-Augmented Generation) system provides intelligent question classification with **speech-to-text capabilities** for voice input questions. Users can now ask questions using their voice instead of typing.

## Key Features

### 🎤 **Voice Input Support**
- **Speech-to-Text**: Real-time voice transcription using OpenAI Whisper
- **Audio Processing**: Base64 audio data handling
- **Voice Classification**: Same intelligent classification for voice questions
- **Hybrid Input**: Support for both text and voice input

### 🧠 **Enhanced RAG Classification**
- **RAG_REQUIRED**: Questions about specific documents
- **GENERAL_AI**: General knowledge questions  
- **HYBRID**: Questions benefiting from both document and general knowledge
- **CLARIFICATION_NEEDED**: Ambiguous questions requiring user input

### 📊 **Confidence Scoring**
- Each classification includes a confidence score (0.0-1.0)
- Low confidence triggers clarification requests
- Transparent reasoning for classification decisions

## Architecture

```
Voice Input → Speech-to-Text → Classification → Routing → Response Generation
     ↓              ↓              ↓              ↓              ↓
Audio Data    Whisper Model   Intent Analysis   Path Selection  Final Answer
```

### Voice Processing Flow

1. **Audio Input**: User provides base64-encoded audio data
2. **Speech Recognition**: Whisper model transcribes audio to text
3. **Question Classification**: System determines intent and confidence
4. **Response Routing**: Routes to appropriate response strategy
5. **Answer Generation**: Provides contextual response

## Files Structure

```
BE/
├── voice_enhanced_rag.py        # Voice-enhanced RAG system with STT
├── main_voice_enhanced.py       # Voice-enhanced WebSocket server
├── test_voice_enhanced.py       # Test script for voice features
├── README_VOICE_ENHANCED.md     # This documentation
├── socket_rag_enhanced.py       # Text-only enhanced system
└── .env                         # API key configuration
```

## Installation & Setup

### 1. **Install Dependencies**
```bash
cd BE
pip3 install openai-whisper soundfile numpy websockets
```

### 2. **Configure API Keys**
Ensure your `.env` file contains:
```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-ada-002
```

### 3. **Start the Voice-Enhanced Server**
```bash
python3 main_voice_enhanced.py
```

## Usage

### **WebSocket API**

The voice-enhanced server runs on `ws://localhost:8766` and supports:

#### **Text Input**
```json
{
  "type": "text",
  "content": "What does the document say about machine learning?"
}
```

#### **Voice Input**
```json
{
  "type": "voice", 
  "content": "base64_encoded_audio_data"
}
```

#### **Response Format**
```json
{
  "type": "response",
  "input_type": "voice",
  "transcription": "Voice input processed",
  "response": "AI-generated response..."
}
```

### **Testing the System**

#### **Automated Testing**
```bash
python3 test_voice_enhanced.py
```

Choose from:
- **Option 1**: Automated text input test
- **Option 2**: Voice input simulation test  
- **Option 3**: Interactive test mode
- **Option 4**: Full system test

#### **Interactive Testing**
```bash
python3 test_voice_enhanced.py
# Choose option 3 for interactive mode
```

## Voice Input Implementation

### **Frontend Integration**

To integrate voice input with your React frontend:

```javascript
// Voice recording component
const VoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result.split(',')[1];
          sendVoiceMessage(base64Audio);
        };
        reader.readAsDataURL(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const sendVoiceMessage = (audioData) => {
    const message = {
      type: 'voice',
      content: audioData
    };
    ws.send(JSON.stringify(message));
  };
  
  return (
    <button onClick={startRecording} disabled={isRecording}>
      {isRecording ? '🎤 Recording...' : '🎤 Start Voice Input'}
    </button>
  );
};
```

### **WebSocket Connection**
```javascript
const ws = new WebSocket('ws://localhost:8766');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'response') {
    if (data.input_type === 'voice') {
      console.log('Voice transcription:', data.transcription);
      console.log('AI response:', data.response);
    } else {
      console.log('Text response:', data.response);
    }
  }
};
```

## Example Classifications

### **Voice Input Examples**

```
🎤 "What does the document say about AI?"
   ↓ (Whisper transcription)
📝 "What does the document say about AI?"
   ↓ (Classification)
🧠 RAG_REQUIRED (confidence: 0.92)
   ↓ (Response)
📄 Document-based answer with citations
```

```
🎤 "How do I calculate the area of a circle?"
   ↓ (Whisper transcription)  
📝 "How do I calculate the area of a circle?"
   ↓ (Classification)
🧠 GENERAL_AI (confidence: 0.95)
   ↓ (Response)
📚 General knowledge answer
```

## Configuration

### **Whisper Model Options**

You can change the Whisper model in `voice_enhanced_rag.py`:

```python
# For faster processing (smaller model)
whisper_model = whisper.load_model("base")

# For better accuracy (larger model)
whisper_model = whisper.load_model("small")
whisper_model = whisper.load_model("medium")
whisper_model = whisper.load_model("large")
```

### **Audio Format Support**

The system supports various audio formats:
- **WAV** (recommended)
- **MP3** (with proper encoding)
- **M4A** (iOS recordings)
- **WebM** (browser recordings)

### **Performance Tuning**

```python
# Adjust classification confidence threshold
if confidence < 0.3:  # Lower = more clarification requests
    return "ask_clarification"

# Adjust document similarity thresholds
if similarity > 0.5:  # RAG threshold
    relevant_docs.append(doc)

if similarity > 0.4:  # Hybrid threshold  
    relevant_docs.append(doc)
```

## Performance Benefits

### 🚀 **Voice Input Advantages**
- **Faster Input**: Speaking is faster than typing
- **Natural Interaction**: More conversational experience
- **Accessibility**: Better for users with typing difficulties
- **Mobile Friendly**: Ideal for mobile devices

### 🎯 **Enhanced Accuracy**
- **Voice Clarity**: Whisper provides high-quality transcription
- **Context Awareness**: Same intelligent classification for voice
- **Error Handling**: Graceful fallback for unclear speech

### 💡 **User Experience**
- **Real-time Processing**: Immediate voice-to-text conversion
- **Visual Feedback**: Transcription display for confirmation
- **Hybrid Mode**: Seamless switching between voice and text

## Troubleshooting

### **Common Voice Issues**

1. **Audio Quality Problems**
   - Ensure clear microphone input
   - Reduce background noise
   - Use proper audio format (WAV recommended)

2. **Transcription Errors**
   - Speak clearly and at normal pace
   - Check microphone permissions
   - Verify audio encoding

3. **WebSocket Connection Issues**
   - Check if server is running on port 8766
   - Verify WebSocket URL
   - Check firewall settings

### **Debug Mode**
Enable detailed logging:
```python
logging.basicConfig(level=logging.DEBUG)
```

### **Audio Testing**
Test audio processing separately:
```python
from voice_enhanced_rag import speech_to_text
result = speech_to_text(your_base64_audio)
print(f"Transcription: {result}")
```

## Migration from Text-Only System

### **Backward Compatibility**
The voice-enhanced system maintains full compatibility:
- Same document processing
- Same RAG classification logic
- Same WebSocket protocol (with extensions)
- Same response format

### **Migration Steps**
1. **Backup existing system**
2. **Install voice dependencies**
3. **Update WebSocket connection to port 8766**
4. **Add voice input components to frontend**
5. **Test with existing documents**

## Future Enhancements

### **Planned Voice Features**
- **Real-time Streaming**: Live voice transcription
- **Voice Activity Detection**: Automatic recording start/stop
- **Multi-language Support**: Non-English voice input
- **Voice Commands**: Special voice commands for system control

### **Advanced Capabilities**
- **Speaker Recognition**: Identify different users
- **Emotion Detection**: Analyze voice tone and emotion
- **Voice Cloning**: Custom voice responses
- **Offline Processing**: Local speech recognition

## Support

For issues with the voice-enhanced system:
1. Check the troubleshooting section
2. Verify audio format and quality
3. Test with the provided test scripts
4. Check WebSocket connection status
5. Review Whisper model installation

---

**Note**: The voice-enhanced system is designed to work alongside your existing frontend. The WebSocket protocol extends the original system to support voice input while maintaining backward compatibility.
