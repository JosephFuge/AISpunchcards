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
          <p>{event.location}</p>
          <p>{eventDateTime}</p>
          <p>{event.description}</p>
          <p>{event.externalUrl}</p>
          {QRCodeData ? <img src={QRCodeData} alt="Event QR Code" className="qr-code-img" /> : <p>Loading QR Code...</p>}
          {QRCodeData ? (
            <a className="link-button" href={QRCodeData} download={`AIS_${event.title}.png`}>
              Download QR Code
            </a>
          ) : (
            <></>
          )}
          <div className="eventActions">
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
            {/* Implement these routes and functionalities */}
            {/* <Link to={`/editEvent/${event.id}`}>Edit</Link> */}
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
