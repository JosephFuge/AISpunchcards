import { useContext, useEffect, useState } from "react";
import { EventList } from "../member/eventList";
import { ClubEvent } from "../models/clubevent";
import { FirebaseContext } from "./firebaseProvider";
import { Timestamp } from "firebase/firestore";
import { Compass, Link as LinkIcon, Users, GraduationCap, Heart } from "phosphor-react";

export function PublicHome() {
  const fireContext = useContext(FirebaseContext);
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  const categories = ["All", "Discover", "Connect", "Socialize", "Learn", "Serve"];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Discover":
        return <Compass size={16} />;
      case "Connect":
        return <LinkIcon size={16} />;
      case "Socialize":
        return <Users size={16} />;
      case "Learn":
        return <GraduationCap size={16} />;
      case "Serve":
        return <Heart size={16} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await fireContext?.db.fetchEvents();

      if (events) {
        const futureEvents: ClubEvent[] = [];
        const currentTimestamp = Timestamp.now();
        for (let tempEvent of events) {
          if (
            tempEvent.datetime &&
            (tempEvent.datetime.seconds > currentTimestamp.seconds || 
             (tempEvent.datetime.seconds === currentTimestamp.seconds && 
              tempEvent.datetime.nanoseconds > currentTimestamp.nanoseconds))
          ) {
            futureEvents.push(tempEvent);
          }
        }

        setUpcomingEvents(futureEvents);
      }
    };

    fetchEvents();
  }, [fireContext?.db]);

  const filterEventsByCategory = (events: ClubEvent[] | null) => {
    if (!events || selectedCategory === "All") {
      return events;
    }
    return events.filter(event => event.category === selectedCategory);
  };

  const closeWelcomeModal = () => {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    setShowWelcomeModal(false);
  };

  const filteredUpcomingEvents = filterEventsByCategory(upcomingEvents);

  return (
    <div id="bodyContainer">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="modal-overlay" onClick={closeWelcomeModal}>
          <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeWelcomeModal}>
              ×
            </button>
            <div className="modal-content">
              <h2>Welcome to AIS Events</h2>
              <p>
                Welcome to the events page for the Association for Information Systems (AIS) club at BYU! 
                Here you can view upcoming events and activities. Log in to check in to events and track your participation.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="public-home-header">
        <h1>AIS Club Events</h1>
        <p className="subtitle">Association for Information Systems - Brigham Young University</p>
      </div>

      <div id="categoryFilter">
        <label>Filter by Category:</label>
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {getCategoryIcon(category)}
              <span>{category}</span>
            </button>
          ))}
        </div>
      </div>

      {!upcomingEvents && <h3>Loading Events...</h3>}
      {upcomingEvents && <h2>Upcoming Events</h2>}
      {filteredUpcomingEvents && <EventList events={filteredUpcomingEvents} />}
      
      {filteredUpcomingEvents && filteredUpcomingEvents.length === 0 && upcomingEvents && upcomingEvents.length > 0 && (
        <h3>No events in the selected category.</h3>
      )}
    </div>
  );
}