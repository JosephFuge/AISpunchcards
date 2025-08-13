import { useContext, useEffect, useMemo, useState } from "react";
import { FirebaseContext } from "../shared/firebaseProvider";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../css/submit_success.css";
import "../css/styles.css";
import { ClubEvent } from "../models/clubevent";
import { getAuth } from "firebase/auth";

export function EventCheckInPage() {
  const { eventId } = useParams();
  const fireContext = useContext(FirebaseContext);
  const db = useMemo(() => fireContext?.db, [fireContext]);
  const navigate = useNavigate();
  const [curEvent, setCurEvent] = useState<ClubEvent | null>(null);
  const [eventDateTime, setEventDateTime] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Get current event so we can check for handshake url
  useEffect(() => {
    const initFetchEvent = async () => {
      if (db && eventId) {
        const clubEvent = await db.fetchEvent(eventId);

        if (clubEvent) {
          setCurEvent(clubEvent);

          // Format the event date and time
          const formattedDate = clubEvent.datetime.toDate().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          setEventDateTime(formattedDate);
        }
      }
    };

    initFetchEvent();
  }, [eventId, db]);

  const handleCheckIn = async (hasPlusOne: boolean) => {
    if (!fireContext?.isAuthenticated) {
      await fireContext?.googleSignIn();
    }

    const auth = getAuth();
    let curUserId: undefined | string | null = undefined;

    if (auth && auth.currentUser) {
      curUserId = auth.currentUser.uid;
    } else if (fireContext?.user?.id) {
      curUserId = fireContext.user.id;
    }

    if (curUserId && eventId) {
      await db?.registerAttendance(eventId, curUserId, hasPlusOne);
      setIsCheckedIn(true);

      // Redirect after a brief delay to show success message
      setTimeout(() => {
        if (curEvent?.externalUrl && curEvent.externalUrl.length > 0) {
          window.location.href = curEvent.externalUrl;
        } else {
          navigate("/");
        }
      }, 2000);
    }
  };

  if (!eventId) {
    return (
      <div className="center-block">
        <h2>Error: No event ID found</h2>
        <p>Please return to the home page and try again.</p>
        <Link to="/" className="ais-button background-ais">
          Go to Home
        </Link>
      </div>
    );
  }

  if (!curEvent) {
    return (
      <div className="center-block">
        <h2>Loading event details...</h2>
      </div>
    );
  }

  if (isCheckedIn) {
    return (
      <div className="center-block">
        <div className="success-message">
          <h2>✅ Successfully Checked In!</h2>
          <p>Thank you for attending <strong>{curEvent.title}</strong></p>
          <p>Redirecting you now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-checkin-container">
      <div className="event-header" style={{ marginTop: 64 }}>
        <h1>{curEvent.title}</h1>
        <div className="event-category-badge">
          <span className={`category-${curEvent.category.toLowerCase()}`}>
            {curEvent.category}
          </span>
        </div>
      </div>

      {/* Event Photos */}
      {curEvent.photoUrls && curEvent.photoUrls.length > 0 && (
        <div className="event-photos-checkin">
          <div className="photo-gallery-checkin">
            {curEvent.photoUrls.slice(0, 3).map((photoUrl, index) => (
              <img
                key={index}
                src={photoUrl}
                width={300}
                alt={`${index + 1}`}
                className="event-photo-checkin"
              />
            ))}
            {curEvent.photoUrls.length > 3 && (
              <div className="more-photos-indicator">
                +{curEvent.photoUrls.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className="event-details-checkin">
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <div>
            <strong>Date & Time</strong>
            <p>{eventDateTime}</p>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">⏱️</span>
          <div>
            <strong>Duration</strong>
            <p>{curEvent.eventDuration} hour{curEvent.eventDuration !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">📍</span>
          <div>
            <strong>Location</strong>
            <p>{curEvent.location}</p>
          </div>
        </div>

        <div className="detail-item description">
          <span className="detail-icon">📝</span>
          <div>
            <strong>Description</strong>
            <p>{curEvent.description}</p>
          </div>
        </div>
      </div>

      <div className="checkin-section">
        <h2>Complete Your Check-In</h2>
        <p>Did you bring a plus one with you today?</p>

        <div className="checkin-buttons">
          <button
            className="checkin-btn yes-btn"
            onClick={() => handleCheckIn(true)}
          >
            <span className="btn-icon">👥</span>
            <div>
              <strong>Yes</strong>
              <small>I brought someone with me</small>
            </div>
          </button>

          <button
            className="checkin-btn no-btn"
            onClick={() => handleCheckIn(false)}
          >
            <span className="btn-icon">👤</span>
            <div>
              <strong>No</strong>
              <small>Just me today</small>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
