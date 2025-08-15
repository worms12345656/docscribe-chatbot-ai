import asyncio
import websockets
from socket_rag_enhanced import handle_user_input_enhanced


async def handler(websocket):
    print("Client connected to enhanced RAG system!")
    try:
        async for message in websocket:
            print("Received from client:", message)
            response = await handle_user_input_enhanced(message)
            await websocket.send(f"{response}")
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("Enhanced WebSocket server running at ws://localhost:8765")
        print("This server uses improved RAG classification!")
        await asyncio.Future()  # Run indefinitely


if __name__ == "__main__":
    asyncio.run(main())
