import { useContext, useEffect, useState } from "react";
import { EventList } from "./eventList";
import { ClubEvent } from "../models/clubevent";
import { FirebaseContext } from "../shared/firebaseProvider";
import { Timestamp } from "firebase/firestore";

export function UserHome() {
  const fireContext = useContext(FirebaseContext);
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[] | null>(
    null
  );
  const [attendedEvents, setAttendedEvents] = useState<ClubEvent[] | null>(
    null
  );
  const [showUpcomingEvents, setShowUpcomingEvents] = useState<boolean>(true);
  // const [];

  useEffect(() => {
    const fetchEvents = async () => {
      // Fetch events and set them
      const events = await fireContext?.db.fetchEvents();

      if (events) {
        // Split events into future and past
        // If the user is not an officer, only show them events that they have attended
        // If the user is an officer, show all past events
        const futureEvents: ClubEvent[] = [];
        const pastEvents: ClubEvent[] = [];
        const currentTimestamp = Timestamp.now();
        for (let tempEvent of events) {
          if (
            tempEvent.datetime &&
            (tempEvent.datetime.seconds > currentTimestamp.seconds ||
              (tempEvent.datetime.seconds === currentTimestamp.seconds &&
                tempEvent.datetime.nanoseconds > currentTimestamp.nanoseconds))
          ) {
            futureEvents.push(tempEvent);
          } else if (
            fireContext?.user &&
            fireContext?.user.id != null &&
            (fireContext?.user.isOfficer ||
              (tempEvent.userAttendees &&
                tempEvent.userAttendees.includes(fireContext?.user.id)))
          ) {
            pastEvents.push(tempEvent);
          }
        }

        setUpcomingEvents(futureEvents);
        setAttendedEvents(pastEvents);
      }
    };

    fetchEvents();
  }, [fireContext?.db, fireContext?.user]);

  function toggle() {
    setShowUpcomingEvents(!showUpcomingEvents);
  }

  return (
    <div id="bodyContainer">
      <div id="toggleEventList">
        <button
          id="attendedToggle"
          className={showUpcomingEvents ? "" : "toggleOn"}
          onClick={() => toggle()}
        >
          {fireContext != null &&
          fireContext.user &&
          fireContext.user.isOfficer ? (
            <p className="no-margin">Past</p>
          ) : (
            <p className="no-margin">Attended</p>
          )}
        </button>
        <button
          id="upcomingToggle"
          className={showUpcomingEvents ? "toggleOn" : ""}
          onClick={() => toggle()}
        >
          Upcoming
        </button>
      </div>
      {showUpcomingEvents && !upcomingEvents && <h3>Loading Events...</h3>}
      {showUpcomingEvents && upcomingEvents && <h2>Upcoming Events</h2>}
      {!showUpcomingEvents && !attendedEvents && <h3>Loading Events...</h3>}
      {!showUpcomingEvents &&
        attendedEvents &&
        !fireContext?.user?.isOfficer && <h2>Events Attended</h2>}
      {!showUpcomingEvents &&
        attendedEvents &&
        fireContext?.user?.isOfficer && <h2>Past Events</h2>}
      {/* Show upcoming events or past events depending on toggle */}
      {showUpcomingEvents && upcomingEvents && (
        <EventList events={upcomingEvents} />
      )}
      {/* <div id="attendedProgress">
        <h3>Total: 5/10</h3>
        <div>
          <p>2/4<br/><span>Discover</span></p>
          <p>0/3<br/><span>Connect</span></p>
          <p>1/2<br/><span>Socialize</span></p>
          <p>0/2<br/><span>Learn</span></p>
          <p>1/4<br/><span>Serve</span></p>
        </div>
      </div> */}
      {!showUpcomingEvents && attendedEvents && (
        <EventList events={attendedEvents} />
      )}
    </div>
  );
}
