import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../css/home.css";
import "../css/styles.css";
import { ClubEvent } from "../models/clubevent";
import { FirebaseContext } from "../shared/firebaseProvider";
import QRCode from "qrcode";

export function ViewEvent() {
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
              <h3>Event Photos</h3>
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
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Date & Time:</strong> {eventDateTime}</p>
            <p><strong>Duration:</strong> {event.eventDuration} hour{event.eventDuration !== 1 ? 's' : ''}</p>
            <p><strong>Description:</strong> {event.description}</p>
            {event.externalUrl && <p><strong>External Link:</strong> <a href={event.externalUrl} target="_blank" rel="noopener noreferrer">{event.externalUrl}</a></p>}
          </div>
          
          <div className="qr-code-section">
            <h3>QR Code for Check-In</h3>
            {QRCodeData ? <img src={QRCodeData} alt="Event QR Code" className="qr-code-img" /> : <p>Loading QR Code...</p>}
            {QRCodeData ? (
              <a className="link-button" href={QRCodeData} download={`AIS_${event.title}.png`}>
                Download QR Code
              </a>
            ) : (
              <></>
            )}
            
            <div className="event-actions">
              <Link to={`/event/${eventId}`} className="view-guest-button">
                View as Guest
              </Link>
              <Link to={`/editEvent/${eventId}`} className="edit-button">
                Edit Event
              </Link>
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
                    <span className="spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : noEventExists == null ? (
        <p>Loading event details...</p>
      ) : noEventExists ? (
        <p>Could not find event. Please return to home page.</p>
      ) : (
        <p></p>
      )}
    </div>
  );
}
