from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path to import main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import fastapi_app

client = TestClient(fastapi_app)

def test_create_room():
    response = client.post("/api/rooms", json={"hostName": "Alice", "language": "python"})
    assert response.status_code == 201
    data = response.json()
    assert "room" in data
    assert "user" in data
    assert data["user"]["name"] == "Alice"
    assert data["room"]["language"] == "python"
    assert data["room"]["code"].startswith("# Start")

def test_join_room():
    # First create a room
    create_resp = client.post("/api/rooms", json={"hostName": "Bob"})
    assert create_resp.status_code == 201
    room_id = create_resp.json()["room"]["id"]
    
    # Join it
    response = client.post(f"/api/rooms/{room_id}/join", json={"userName": "Charlie"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["name"] == "Charlie"
    # Check participants count in the returned room object
    assert len(data["room"]["participants"]) == 2

def test_get_room():
    # Create room
    create_resp = client.post("/api/rooms", json={"hostName": "Dave"})
    room_id = create_resp.json()["room"]["id"]
    
    # Get room
    response = client.get(f"/api/rooms/{room_id}")
    assert response.status_code == 200
    assert response.json()["id"] == room_id

def test_get_nonexistent_room():
    response = client.get("/api/rooms/nonexistent")
    assert response.status_code == 404
