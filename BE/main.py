import asyncio
import websockets
from socket_rag import handle_user_input
import json
import base64
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import re

SEND_FILE_PROMPT = (
    "Save the file with name in folder documents for me.\n"
    "Name: {filename} \n"
)

SEND_FILE_WITH_MESSAGE_PROMPT = (
    "Save the file with name in folder documents for me and answer my question.\n"
    "Name: {filename} \n"
    "Question: {question}"
)

# Start HTTP server for serving audio files
def start_http_server():
    class AudioHandler(SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
    
    server = HTTPServer(('localhost', 8000), AudioHandler)
    print("HTTP server running at http://localhost:8000")
    server.serve_forever()

# Start HTTP server in a separate thread
http_thread = threading.Thread(target=start_http_server, daemon=True)
http_thread.start()

async def handler(websocket):
    print("Client đã kết nối!")
    folder_path = "./documents"
    files = [f for f in os.listdir(folder_path) if os.path.isfile(
        os.path.join(folder_path, f))]
    await websocket.send(json.dumps({"files": files}))
    try:
        async for message in websocket:

            data = json.loads(message)
            print("Message:", data["message"])
            print("Filename:", data["filename"])
            filename = data["filename"]
            user_message = data["message"]
            extension = ""
            if filename is not None:
                extension = os.path.splitext(filename)[1]
            if not data["fileData"]:
                response = await handle_user_input(data["message"])
                
                # Check if response contains audio file information (JSON format)
                try:
                    # Try to parse as JSON first
                    response_json = json.loads(response)
                    if "audio_base64" in response_json:
                        # This is a TTS response with base64 audio
                        response_data = {
                            "text": response,
                            "audio": {
                                "filename": response_json.get("filename", ""),
                                "audio_base64": response_json.get("audio_base64", ""),
                                "file_size": response_json.get("file_size", 0),
                                "status": response_json.get("status", "success")
                            }
                        }
                        await websocket.send(json.dumps(response_data))
                        return
                except json.JSONDecodeError:
                    # Not JSON, check for old format
                    audio_match = re.search(r'File: (tts_\d{8}_\d{6}_\d{3}\.wav)', response)
                    if audio_match:
                        audio_filename = audio_match.group(1)
                        audio_url = f"http://localhost:8000/audio_files/{audio_filename}"
                        
                        # Send both text response and audio information
                        response_data = {
                            "text": response,
                            "audio": {
                                "filename": audio_filename,
                                "url": audio_url
                            }
                        }
                        await websocket.send(json.dumps(response_data))
                        return
                
                # No audio found, send regular response
                await websocket.send(f"{response}")
            else:
                if extension and extension.lower() in [".pdf", ".txt"]:
                    file_bytes = base64.b64decode(data["fileData"])
                    with open(f"./documents/{filename}", "wb") as f:
                        f.write(file_bytes)
                    await websocket.send(json.dumps({"files": files}))
                    if user_message == "No Question":
                        prompt = SEND_FILE_PROMPT.format(filename=filename)
                    else:
                        prompt = SEND_FILE_WITH_MESSAGE_PROMPT.format(
                            filename=filename,
                            question=user_message)
                    response = await handle_user_input(prompt)
                    
                    # Check if response contains audio file information (JSON format)
                    try:
                        # Try to parse as JSON first
                        response_json = json.loads(response)
                        if "audio_base64" in response_json:
                            # This is a TTS response with base64 audio
                            response_data = {
                                "text": response,
                                "audio": {
                                    "filename": response_json.get("filename", ""),
                                    "audio_base64": response_json.get("audio_base64", ""),
                                    "file_size": response_json.get("file_size", 0),
                                    "status": response_json.get("status", "success")
                                }
                            }
                            await websocket.send(json.dumps(response_data))
                            return
                    except json.JSONDecodeError:
                        # Not JSON, check for old format
                        audio_match = re.search(r'File: (tts_\d{8}_\d{6}_\d{3}\.wav)', response)
                        if audio_match:
                            audio_filename = audio_match.group(1)
                            audio_url = f"http://localhost:8000/audio_files/{audio_filename}"
                            
                            # Send both text response and audio information
                            response_data = {
                                "text": response,
                                "audio": {
                                    "filename": audio_filename,
                                    "url": audio_url
                                }
                            }
                            await websocket.send(json.dumps(response_data))
                            return
                    
                    # No audio found, send regular response
                    await websocket.send(f"{response}")

    except websockets.exceptions.ConnectionClosed:
        print("Client ngắt kết nối")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server chạy tại ws://localhost:8765")
        await asyncio.Future()  # Chạy vô hạn

asyncio.run(main())
