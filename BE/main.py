import asyncio
import websockets
from socket_rag import handle_user_input
import json
import base64


async def handler(websocket):
    print("Client đã kết nối!")
    try:
        async for message in websocket:
            data = json.loads(message)
            print("Message:", data["message"])
            print("Filename:", data["filename"])
            file_bytes = base64.b64decode(data["fileData"])
            with open(f"./documents/{data["filename"]}", "wb") as f:
                f.write(file_bytes)
            await websocket.send("File and message received!")
            response = await handle_user_input(data["message"])
            await websocket.send(f"{response}")
    except websockets.exceptions.ConnectionClosed:
        print("Client ngắt kết nối")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server chạy tại ws://localhost:8765")
        await asyncio.Future()  # Chạy vô hạn

asyncio.run(main())
