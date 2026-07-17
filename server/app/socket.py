import json

from flask_sock import Sock

from app.envelope_status_store import envelope_status_store

sock = Sock()


def init_realtime(app):
    sock.init_app(app)

    @sock.route('/api/ws/envelopes')
    def envelope_updates(ws):
        envelope_status_store.register_client(ws)
        try:
            ws.send(json.dumps(envelope_status_store.all()))

            while True:
                message = ws.receive()
                if message is None:
                    break
        except Exception:
            pass
        finally:
            envelope_status_store.unregister_client(ws)