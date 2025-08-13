import asyncio
import websockets
from socket_rag import handle_user_input


async def handler(websocket):
    print("Client đã kết nối!")
    try:
        async for message in websocket:
            print("Nhận từ client:", message)
            response = await handle_user_input(message)
            await websocket.send(f"{response}")
    except websockets.exceptions.ConnectionClosed:
        print("Client ngắt kết nối")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server chạy tại ws://localhost:8765")
        await asyncio.Future()  # Chạy vô hạn

asyncio.run(main())
