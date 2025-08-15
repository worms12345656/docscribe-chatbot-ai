import asyncio
import websockets
import json
import base64
from voice_enhanced_rag import handle_voice_enhanced_input, process_audio_chunk


async def voice_handler(websocket):
    """Handle WebSocket connections with voice and text support."""
    print("🎤 Client connected to voice-enhanced RAG system!")
    print("📝 Supported input types: text, voice (base64 audio)")
    
    try:
        async for message in websocket:
            try:
                # Try to parse as JSON for structured messages
                data = json.loads(message)
                input_type = data.get("type", "text")
                content = data.get("content", "")
                
                print(f"📨 Received {input_type} input from client")
                
                if input_type == "voice":
                    # Handle voice input (base64 audio)
                    if not content:
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": "No audio content provided"
                        }))
                        continue
                    
                    # Process the voice input
                    response = await handle_voice_enhanced_input(content, "voice")
                    
                    # Send response with metadata
                    await websocket.send(json.dumps({
                        "type": "response",
                        "input_type": "voice",
                        "transcription": "Voice input processed",
                        "response": response
                    }))
                    
                elif input_type == "text":
                    # Handle text input
                    if not content:
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": "No text content provided"
                        }))
                        continue
                    
                    # Process the text input
                    response = await handle_voice_enhanced_input(content, "text")
                    
                    # Send response
                    await websocket.send(json.dumps({
                        "type": "response",
                        "input_type": "text",
                        "response": response
                    }))
                    
                else:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": f"Unsupported input type: {input_type}"
                    }))
                    
            except json.JSONDecodeError:
                # Handle plain text messages (backward compatibility)
                print(f"📝 Received plain text: {message}")
                response = await handle_voice_enhanced_input(message, "text")
                await websocket.send(response)
                
    except websockets.exceptions.ConnectionClosed:
        print("🔌 Client disconnected from voice-enhanced system")


async def main():
    """Start the voice-enhanced WebSocket server."""
    async with websockets.serve(voice_handler, "localhost", 8766):
        print("🎤 Voice-Enhanced WebSocket server running at ws://localhost:8766")
        print("🔧 Features:")
        print("   • Text input (JSON or plain text)")
        print("   • Voice input (base64 audio)")
        print("   • Enhanced RAG classification")
        print("   • Speech-to-text with Whisper")
        print("   • Real-time processing")
        print("=" * 50)
        await asyncio.Future()  # Run indefinitely


if __name__ == "__main__":
    asyncio.run(main())
