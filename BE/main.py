import asyncio
import websockets
from socket_rag import handle_user_input
import json
import base64
import os

SEND_FILE_PROMPT = (
    "Save the file with name in folder documents for me.\n"
    "Name: {filename} \n"
)

SEND_FILE_WITH_MESSAGE_PROMPT = (
    "Save the file with name in folder documents for me and answer my question.\n"
    "Name: {filename} \n"
    "Question: {question}"
)


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
                    print(prompt)
                    response = await handle_user_input(prompt)
                    await websocket.send(f"{response}")

    except websockets.exceptions.ConnectionClosed:
        print("Client ngắt kết nối")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server chạy tại ws://localhost:8765")
        await asyncio.Future()  # Chạy vô hạn

asyncio.run(main())
