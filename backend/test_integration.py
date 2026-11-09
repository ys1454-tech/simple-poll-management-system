"""
Integration test suite for the Simple Poll Management System.
Uses SQLite in-memory database and FastAPI TestClient with dependency overrides.
"""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core import database
from app.core.database import Base, get_db

# Configure in-memory SQLite engine for isolated testing
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
database.engine = test_engine

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


from app.main import app

app.dependency_overrides[get_db] = override_get_db


def run_tests():
    print("--- Starting Full Integration Tests ---")
    with TestClient(app) as client:
        # Test 1: Application startup and health endpoint
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        assert res.json() == {
            "status": "healthy",
            "service": "Simple Poll Management System",
        }
        print("[PASS] Test 1: Application startup & health endpoint passed (HTTP 200)")

        # Test 2: Create a poll with multiple options
        poll_payload = {
            "question": "Which programming language do you prefer for backend?",
            "options": ["Python", "Java", "Go", "TypeScript"],
        }
        res = client.post("/polls", json=poll_payload)
        assert res.status_code == 201, f"Create poll failed: {res.text}"
        poll_data = res.json()
        poll_id = poll_data["id"]
        options = poll_data["options"]
        assert poll_data["question"] == poll_payload["question"]
        assert poll_data["status"] == "open"
        assert len(options) == 4
        print(f"[PASS] Test 2: Create poll with multiple options passed (ID: {poll_id}, Options: {len(options)})")

        # Test 3: Retrieve all polls
        res = client.get("/polls")
        assert res.status_code == 200
        polls = res.json()
        assert len(polls) >= 1
        assert any(p["id"] == poll_id for p in polls)
        print(f"[PASS] Test 3: Retrieve all polls passed (Found {len(polls)} poll(s))")

        # Test 4: Retrieve poll details
        res = client.get(f"/polls/{poll_id}")
        assert res.status_code == 200
        assert res.json()["id"] == poll_id
        assert res.json()["question"] == poll_payload["question"]
        print("[PASS] Test 4: Retrieve poll details passed")

        # Test 5: Cast a valid vote
        opt_python = options[0]["id"]
        opt_java = options[1]["id"]
        res = client.post(
            f"/polls/{poll_id}/vote",
            json={"student_id": "STU_1001", "option_id": opt_python},
        )
        assert res.status_code == 201, f"Cast vote failed: {res.text}"
        vote = res.json()
        assert vote["student_id"] == "STU_1001"
        assert vote["option_id"] == opt_python
        print("[PASS] Test 5: Cast valid vote passed (Student: STU_1001 -> Python)")

        # Test 6: Reject a duplicate vote
        res = client.post(
            f"/polls/{poll_id}/vote",
            json={"student_id": "STU_1001", "option_id": opt_java},
        )
        assert res.status_code == 409, f"Expected 409 Conflict, got {res.status_code}: {res.text}"
        assert "already voted" in res.json()["detail"].lower()
        print("[PASS] Test 6: Reject duplicate vote passed (HTTP 409 Conflict, database constraint enforced)")

        # Cast second valid vote from a different student
        res = client.post(
            f"/polls/{poll_id}/vote",
            json={"student_id": "STU_1002", "option_id": opt_python},
        )
        assert res.status_code == 201

        # Test 8: Reject an invalid option
        res = client.post(
            f"/polls/{poll_id}/vote",
            json={"student_id": "STU_1003", "option_id": 99999},
        )
        assert res.status_code == 400, f"Expected 400 Bad Request, got {res.status_code}: {res.text}"
        assert "does not exist" in res.json()["detail"].lower()
        print("[PASS] Test 8: Reject invalid option passed (HTTP 400 Bad Request)")

        # Test 9: Retrieve poll results and percentages
        res = client.get(f"/polls/{poll_id}/results")
        assert res.status_code == 200
        results = res.json()
        assert results["total_votes"] == 2
        py_opt = next(r for r in results["results"] if r["option_id"] == opt_python)
        java_opt = next(r for r in results["results"] if r["option_id"] == opt_java)
        assert py_opt["vote_count"] == 2
        assert py_opt["percentage"] == 100.0
        assert java_opt["vote_count"] == 0
        assert java_opt["percentage"] == 0.0
        print(f"[PASS] Test 9: Retrieve poll results passed (Total votes: {results['total_votes']}, Python: {py_opt['percentage']}%)")

        # Test 10: Close a poll
        res = client.patch(f"/polls/{poll_id}/close")
        assert res.status_code == 200
        assert res.json()["status"] == "closed"
        print("[PASS] Test 10: Close poll passed (Status updated to 'closed')")

        # Test 7: Reject voting on a closed poll
        res = client.post(
            f"/polls/{poll_id}/vote",
            json={"student_id": "STU_1004", "option_id": opt_python},
        )
        assert res.status_code == 400, f"Expected 400 Bad Request, got {res.status_code}: {res.text}"
        assert "closed" in res.json()["detail"].lower()
        print("[PASS] Test 7: Reject voting on closed poll passed (HTTP 400 Bad Request)")

        # Test 11: Verify closed polls retain their results
        res = client.get(f"/polls/{poll_id}/results")
        assert res.status_code == 200
        retained = res.json()
        assert retained["status"] == "closed"
        assert retained["total_votes"] == 2
        retained_py = next(r for r in retained["results"] if r["option_id"] == opt_python)
        assert retained_py["vote_count"] == 2
        assert retained_py["percentage"] == 100.0
        print(f"[PASS] Test 11: Verify closed poll retains results passed (Preserved total: {retained['total_votes']})")

    print("\n==============================================")
    print("ALL 11 INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
    print("==============================================")


if __name__ == "__main__":
    run_tests()
