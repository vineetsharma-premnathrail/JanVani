from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.complaint import Complaint
from app.models.status_notification import StatusNotification
from app.models.user import User
from app.schemas.user import NotificationOut, ProfileUpdate, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserOut)
def update_me(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.first_name = payload.first_name.strip()
    user.last_name = payload.last_name.strip()
    user.address = payload.address.strip()
    user.constituency = payload.constituency.strip()
    user.pincode = payload.pincode.strip()
    user.state = payload.state.strip()

    # Only the last 4 digits are ever persisted — the full number is
    # discarded immediately after this request completes.
    if payload.aadhaar is not None:
        user.aadhaar_last4 = payload.aadhaar[-4:]

    db.commit()
    db.refresh(user)
    return user


@router.get("/me/notifications", response_model=list[NotificationOut])
def get_my_notifications(
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Batched, pull-based delivery — see app/models/status_notification.py.
    Capping to `limit` and marking rows delivered in this same request means
    an MP bulk-updating many complaints never costs this citizen's client
    more than one bounded fetch, however many changes queued up."""
    rows = db.execute(
        select(StatusNotification, Complaint.category)
        .join(Complaint, Complaint.id == StatusNotification.complaint_id)
        .where(StatusNotification.user_id == user.id, StatusNotification.delivered_at.is_(None))
        .order_by(StatusNotification.created_at.asc())
        .limit(limit)
    ).all()

    out = [
        NotificationOut(
            id=n.id,
            complaint_id=n.complaint_id,
            category=category,
            old_status=n.old_status,
            new_status=n.new_status,
            created_at=n.created_at,
        )
        for n, category in rows
    ]

    now = datetime.now(timezone.utc)
    for n, _ in rows:
        n.delivered_at = now
    db.commit()

    return out
