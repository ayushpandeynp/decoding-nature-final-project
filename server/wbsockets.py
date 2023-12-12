import asyncio
import websockets
import json
from logger import setupLogger
import os

logger = setupLogger('websocket_server')

positions = {}

browser = None

PORT = os.environ["PORT"] if "PORT" in os.environ else 8080


async def register(websocket):
    logger.debug("Registered a new device.")
    global browser, positions

    # fail safe
    if not os.path.exists("tracker.txt"):
        browser = None
        positions = {}

        for task in asyncio.all_tasks():
            task.cancel()

        f = open("tracker.txt", "w")
        f.close()

    if browser is None:
        browser = websocket
        await websocket.send("BROWSER")
        logger.info("Display connected.")

        return 0
    else:
        player_id = len(positions) + 1
        positions[player_id] = "0,0"
        await websocket.send(str(player_id))
        await notify_users()
        return player_id


async def unregister(player_id):
    logger.debug("Removed device " + str(player_id) + ".")
    global browser
    if positions.get(player_id):
        del positions[player_id]
        await notify_users()


async def notify_users():
    global browser, positions
    if browser and positions:
        message = json.dumps(positions)
        try:
            await browser.send(message)
        except websockets.exceptions.ConnectionClosedOK as e:
            logger.debug("Display disconnected.")
            browser = None
            positions = {}

            for task in asyncio.all_tasks():
                task.cancel()
    else:
        logger.debug("No browser or no positions.")


async def handler(websocket, path):
    global browser, positions

    player_id = await register(websocket)
    while True:
        refreshed = False
        async for message in websocket:
            logger.debug(f"[NEW MESSAGE] FROM Player {player_id}: {message}")

            if message == "REFRESH":
                logger.debug("Display refreshed.")

                browser = None
                positions = {}

                for task in asyncio.all_tasks():
                    task.cancel()

                refreshed = True

                break

            positions[player_id] = message
            await notify_users()

        if refreshed:
            break

# if using TLS connection
# ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# ssl_context.load_cert_chain(
#     certfile="cert.pem", keyfile="key.pem", password=os.environ["SSL_PASSWORD"])

start_server = websockets.serve(handler, "", PORT)
logger.info(f"[LISTENING] WebSocket server started on port {PORT}")
print(f"[LISTENING] WebSocket server started on port {PORT}", flush=True)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
