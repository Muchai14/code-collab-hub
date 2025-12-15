import httpx
import sys
import time

BASE_URL = "http://localhost:3001"

def check_server_health():
    """Wait for server to be available."""
    print(f"Checking if server is running at {BASE_URL}...")
    for i in range(5):
        try:
            # We don't have a health endpoint, but we can try a GET on a non-existent room or just check connection
            httpx.get(f"{BASE_URL}/api/rooms/health-check-probe", timeout=2)
            # If we get a response (even 404), the server is up
            print("Server is up!")
            return True
        except httpx.ConnectError:
            print("Server not ready yet, retrying...")
            time.sleep(1)
    return False

def verify_api():
    client = httpx.Client(base_url=BASE_URL)
    
    print("\n1. Testing Create Room...")
    try:
        response = client.post("/api/rooms", json={"hostName": "Tester", "language": "python"})
        if response.status_code != 201:
            print(f"FAILED: Expected 201, got {response.status_code}")
            print(response.text)
            sys.exit(1)
        
        data = response.json()
        room_id = data["room"]["id"]
        print(f"SUCCESS: Room created with ID: {room_id}")
        
    except Exception as e:
        print(f"FAILED: {e}")
        sys.exit(1)

    print("\n2. Testing Join Room...")
    try:
        response = client.post(f"/api/rooms/{room_id}/join", json={"userName": "Joiner"})
        if response.status_code != 200:
            print(f"FAILED: Expected 200, got {response.status_code}")
            print(response.text)
            sys.exit(1)
            
        data = response.json()
        participants = data["room"]["participants"]
        print(f"SUCCESS: Joined room. Participants: {len(participants)}")
        
    except Exception as e:
        print(f"FAILED: {e}")
        sys.exit(1)

    print("\n3. Testing Get Room Details...")
    try:
        response = client.get(f"/api/rooms/{room_id}")
        if response.status_code != 200:
            print(f"FAILED: Expected 200, got {response.status_code}")
            print(response.text)
            sys.exit(1)
            
        data = response.json()
        if data["id"] != room_id:
            print(f"FAILED: Room ID mismatch. Expected {room_id}, got {data['id']}")
            sys.exit(1)
            
        print("SUCCESS: Retrieved room details correctly.")
        
    except Exception as e:
        print(f"FAILED: {e}")
        sys.exit(1)

    print("\nAll API verification tests passed! ✅")

if __name__ == "__main__":
    if not check_server_health():
        print("Error: Server is not running. Please start the backend server first.")
        sys.exit(1)
    
    verify_api()
