import { useTranslation } from "react-i18next";
import { useContext, useEffect, useMemo, useState } from "react";
import { FirebaseContext } from "../shared/firebaseProvider";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../css/submit_success.css";
import "../css/styles.css";
import { ClubEvent } from "../models/clubevent";
import { getAuth } from "firebase/auth";
import { Calendar, Clock, MapPin, FileText, Users, User, Compass, Link as LinkIcon, GraduationCap, Heart } from "phosphor-react";

export function EventCheckInPage() {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const fireContext = useContext(FirebaseContext);
  const db = useMemo(() => fireContext?.db, [fireContext]);
  const navigate = useNavigate();
  const [curEvent, setCurEvent] = useState<ClubEvent | null>(null);
  const [eventDateTime, setEventDateTime] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Discover":
        return <Compass size={20} />;
      case "Connect":
        return <LinkIcon size={20} />;
      case "Socialize":
        return <Users size={20} />;
      case "Learn":
        return <GraduationCap size={20} />;
      case "Serve":
        return <Heart size={20} />;
      default:
        return null;
    }
  };

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
        <h2>{t("error_no_event_id_found")}</h2>
        <p>{t("please_return_to_the_home_page_and_try_again")}</p>
        <Link to="/" className="ais-button background-ais">{t("go_to_home")}</Link>
      </div>
    );
  }

  if (!curEvent) {
    return (
      <div className="center-block">
        <h2>{t("loading_event_details")}</h2>
      </div>
    );
  }

  if (isCheckedIn) {
    return (
      <div className="center-block">
        <div className="success-message">
          <h2>{t("_successfully_checked_in")}</h2>
          <p>{t("thank_you_for_attending")}<strong>{curEvent.title}</strong></p>
          <p>{t("redirecting_you_now")}</p>
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
            {getCategoryIcon(curEvent.category)}
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
          <span className="detail-icon"><Calendar size={20} /></span>
          <div>
            <strong>{t("date__time")}</strong>
            <p>{eventDateTime}</p>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon"><Clock size={20} /></span>
          <div>
            <strong>Duration</strong>
            <p>{curEvent.eventDuration} hour{curEvent.eventDuration !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon"><MapPin size={20} /></span>
          <div>
            <strong>Location</strong>
            <p>{curEvent.location}</p>
          </div>
        </div>

        <div className="detail-item description">
          <span className="detail-icon"><FileText size={20} /></span>
          <div>
            <strong>Description</strong>
            <p>{curEvent.description}</p>
          </div>
        </div>
      </div>
      <div className="checkin-section">
        {!fireContext?.isAuthenticated ? (
          <>
            <h2>{t("sign_in_to_check_in")}</h2>
            <p>{t("please_sign_in_with_your_google_account_to_check_i")}</p>
            <button
              className="checkin-btn login-btn mx-auto"
              onClick={() => fireContext?.googleSignIn()}
            >
              <span className="btn-icon"><User size={24} /></span>
              <div>
                <strong>{t("sign_in_with_google")}</strong>
                <small>{t("required_to_check_in_to_events")}</small>
              </div>
            </button>
          </>
        ) : (
          <>
            <h2>{t("complete_your_checkin")}</h2>
            <p>{t("did_you_bring_a_plus_one_with_you_today")}</p>

            <div className="checkin-buttons">
              <button
                className="checkin-btn yes-btn"
                onClick={() => handleCheckIn(true)}
              >
                <span className="btn-icon"><Users size={24} /></span>
                <div>
                  <strong>Yes</strong>
                  <small>{t("i_brought_someone_with_me")}</small>
                </div>
              </button>

              <button
                className="checkin-btn no-btn"
                onClick={() => handleCheckIn(false)}
              >
                <span className="btn-icon"><User size={24} /></span>
                <div>
                  <strong>No</strong>
                  <small>{t("just_me_today")}</small>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
