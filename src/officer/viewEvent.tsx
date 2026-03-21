import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../css/home.css";
import "../css/styles.css";
import { ClubEvent } from "../models/clubevent";
import { FirebaseContext } from "../shared/firebaseProvider";
import QRCode from "qrcode";

export function ViewEvent() {
  const { t } = useTranslation();
  const fireContext = useContext(FirebaseContext);
  const { eventId } = useParams<{ eventId: string }>(); // Extracting event ID from the URL
  const navigate = useNavigate();

  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [eventDateTime, setEventDateTime] = useState<string>("");
  const [noEventExists, setNoEventExists] = useState<boolean | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [QRCodeData, setQRCodeData] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (fireContext && eventId) {
        const eventData = await fireContext.db.fetchEvent(eventId); // Implement this method based on your database logic
        if (eventData) {
          setEvent(eventData);

          // Convert datetime into readable format
          const formattedDate = eventData.datetime.toDate().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          console.log(window.location.href);

          const baseURL = window.location.href.substring(0, window.location.href.indexOf("/viewEvent"));

          const qrCode = await QRCode.toDataURL(`${baseURL}/event/${eventId}`);

          setQRCodeData(qrCode);

          setEventDateTime(formattedDate);
          setNoEventExists(false);
        } else {
          setNoEventExists(true);
        }
      } else {
        setNoEventExists(true);
      }
    };

    fetchEvent();
  }, [eventId, fireContext]);

  return (
    <div>
      {event ? (
        <div id="bodyContainer">
          <h2>{event.title}</h2>

          {/* Event Photos */}
          {event.photoUrls && event.photoUrls.length > 0 && (
            <div className="event-photos">
              <h3>{t("event_photos")}</h3>
              <div className="photo-gallery">
                {event.photoUrls.map((photoUrl, index) => (
                  <img
                    key={index}
                    src={photoUrl}
                    alt={`Event photo ${index + 1}`}
                    className="event-photo"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="event-details">
            <p><strong>{t("location")}</strong> {event.location}</p>
            <p><strong>{t("date__time")}</strong> {eventDateTime}</p>
            <p><strong>{t("duration")}</strong> {event.eventDuration} hour{event.eventDuration !== 1 ? 's' : ''}</p>
            <p><strong>{t("description")}</strong> {event.description}</p>
            {event.externalUrl && <p><strong>{t("external_link")}</strong> <a href={event.externalUrl} target="_blank" rel="noopener noreferrer">{event.externalUrl}</a></p>}
          </div>

          <div className="qr-code-section">
            <h3>{t("qr_code_for_checkin")}</h3>
            {QRCodeData ? <img src={QRCodeData} alt={t("event_qr_code")} className="qr-code-img" /> : <p>{t("loading_qr_code")}</p>}
            {QRCodeData ? (
              <a className="link-button" href={QRCodeData} download={`AIS_${event.title}.png`}>
                <span>{t("download_qr_code")}</span>
              </a>
            ) : (
              <></>
            )}

            <div className="event-actions">
              <Link to={`/event/${eventId}`} className="view-guest-button">{t("view_as_guest")}</Link>
              <Link to={`/editEvent/${eventId}`} className="edit-button">{t("edit_event")}</Link>
              <button
                type="button"
                className="edit-button"
                onClick={() => {
                  if (event) {
                    // Create query parameters with event data, excluding date/time
                    const params = new URLSearchParams({
                      duplicate: 'true',
                      title: event.title,
                      description: event.description,
                      location: event.location,
                      handshakeUrl: event.externalUrl || '',
                      category: event.category,
                      eventDuration: event.eventDuration.toString()
                    });
                    navigate(`/createEvent?${params.toString()}`);
                  }
                }}
              >{t("duplicate_event")}</button>
              <button
                type="button"
                className="danger-button"
                disabled={isDeleting}
                onClick={async () => {
                  console.log('Attempting to delete event: ', eventId);
                  if (eventId) {
                    setIsDeleting(true);
                    try {
                      await fireContext?.db.deleteEvent(eventId);
                      navigate('/');
                    } catch (error) {
                      console.error('Error deleting event: ', error);
                    } finally {
                      setIsDeleting(false);
                    }
                  }
                }}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner"></span>{t("deleting")}</>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : noEventExists == null ? (
        <p>{t("loading_event_details")}</p>
      ) : noEventExists ? (
        <p>{t("could_not_find_event_please_return_to_home_page")}</p>
      ) : (
        <p></p>
      )}
    </div>
  );
}
