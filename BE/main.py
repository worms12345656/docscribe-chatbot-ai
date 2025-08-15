import asyncio
import websockets
from socket_rag import handle_user_input
import json
import base64
import os

SEND_FILE_PROMPT = (
    "Load the document with file name is the file user upload and store it into vector db"
    "File name: {filename} \n"
    "If file extension isn't pdf or txt. Tell user that only accept .pdf or .txt file"
    "Then execute user question base on stored data: {question}"
)


async def handler(websocket):
    print("Client đã kết nối!")
    try:
        async for message in websocket:
            data = json.loads(message)
            print("Message:", data["message"])
            print("Filename:", data["filename"])
            filename = data["filename"]
            extension = ""
            if filename != "None":
                extension = os.path.splitext(filename)[1]
            if data["fileData"] and extension and extension.lower() in [".pdf", ".txt"]:
                file_bytes = base64.b64decode(data["fileData"])
                with open(f"./documents/{data["filename"]}", "wb") as f:
                    f.write(file_bytes)
                prompt = SEND_FILE_PROMPT.format(
                    filename=data["filename"], question=data["message"])
                response = await handle_user_input(prompt)
                await websocket.send(f"{response}")
            else:
                response = await handle_user_input(data["message"])
                await websocket.send(f"{response}")

            # await websocket.send("File and message received!")

    except websockets.exceptions.ConnectionClosed:
        print("Client ngắt kết nối")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server chạy tại ws://localhost:8765")
        await asyncio.Future()  # Chạy vô hạn

asyncio.run(main())
