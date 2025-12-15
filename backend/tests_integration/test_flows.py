import pytest
from sqlalchemy import select
from db_models import DBRoom, DBUser

@pytest.mark.asyncio
async def test_create_room_flow(client, db_session):
    # 1. Create a room
    response = await client.post("/api/rooms", json={"hostName": "IntegrationHost", "language": "python"})
    assert response.status_code == 201
    data = response.json()
    
    room_id = data["room"]["id"]
    user_id = data["user"]["id"]
    
    assert data["room"]["hostId"] == user_id
    assert data["user"]["name"] == "IntegrationHost"
    
    # 2. Verify in DB directly
    result = await db_session.execute(select(DBRoom).filter(DBRoom.id == room_id))
    db_room = result.scalars().first()
    assert db_room is not None
    assert db_room.language == "python"
    
    result = await db_session.execute(select(DBUser).filter(DBUser.id == user_id))
    db_user = result.scalars().first()
    assert db_user is not None
    assert db_user.isHost == True

@pytest.mark.asyncio
async def test_join_room_flow(client, db_session):
    # 1. Create a room first
    create_resp = await client.post("/api/rooms", json={"hostName": "HostUser"})
    room_id = create_resp.json()["room"]["id"]
    
    # 2. Join the room
    join_resp = await client.post(f"/api/rooms/{room_id}/join", json={"userName": "JoinerUser"})
    assert join_resp.status_code == 200
    join_data = join_resp.json()
    
    assert join_data["user"]["name"] == "JoinerUser"
    assert join_data["user"]["isHost"] == False
    
    # Verify participants list in response includes both
    participants = join_data["room"]["participants"]
    assert len(participants) == 2
    names = [p["name"] for p in participants]
    assert "HostUser" in names
    assert "JoinerUser" in names
    
    # 3. Verify in DB
    result = await db_session.execute(select(DBUser).filter(DBUser.roomId == room_id))
    users = result.scalars().all()
    assert len(users) == 2

@pytest.mark.asyncio
async def test_get_room_flow(client):
    # 1. Create
    create_resp = await client.post("/api/rooms", json={"hostName": "ViewerHost"})
    room_id = create_resp.json()["room"]["id"]
    
    # 2. Get
    get_resp = await client.get(f"/api/rooms/{room_id}")
    assert get_resp.status_code == 200
    room_data = get_resp.json()
    
    assert room_data["id"] == room_id
    assert room_data["code"] is not None

@pytest.mark.asyncio
async def test_room_not_found(client):
    response = await client.get("/api/rooms/nonexistent-id")
    assert response.status_code == 404
