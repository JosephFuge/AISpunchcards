import { useContext } from "react";
import { ClubEvent } from "../models/clubevent";
import { FirebaseContext } from "../shared/firebaseProvider";
import "../css/styles.css";
import "../css/home.css";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: ClubEvent;
}

export function EventCard({ ...EventCardProps }) {
  const fireContext = useContext(FirebaseContext);

  const currentEvent = {
    ...EventCardProps.event,
  };

  currentEvent.datetime = currentEvent.datetime.toDate();

  const formattedDate = currentEvent.datetime.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if current user has RSVP'd to this event
  const hasRSVPd = fireContext?.user?.uid && EventCardProps.event.userAttendees.includes(fireContext.user.uid);

  const isOfficer = fireContext != null && fireContext.user != null && fireContext.user.isOfficer;
  const eventUrl = isOfficer ? `/viewEvent/${EventCardProps.event.id}` : `/event/${EventCardProps.event.id}`;

  return (
    <Link to={eventUrl} className="eventCard">
      <div className="eventInfo">
        <h3>{EventCardProps.event.title}
          {hasRSVPd && <span className="rsvp-indicator">✓ RSVP'd</span>}
        </h3>
        <p>{formattedDate}</p>
        <p>{EventCardProps.event.location}</p>
        <p>{EventCardProps.event.description}</p>
      </div>
      {/* Allow only officers to open the event and see further details, including QR code */}
      {isOfficer && EventCardProps.event && EventCardProps.event.userAttendees && (
        <div className="officerEventInfo">
          <div
            className={`eventAttendance ${
              {
                /* showUpcomingEvents ? "hidden" : ""*/
              }
            }`}
          >
            <h3>{EventCardProps.event.additionalAttendance + !Number.isNaN(EventCardProps.event.userAttendees.length) ? EventCardProps.event.userAttendees.length : 0}</h3>
            <p>Attended</p>
          </div>
          {/* <div className="eventOpen"> */}
          <div className="officer-open-link">Open</div>
          {/* </div> */}
        </div>
      )}
    </Link>
  );
}
