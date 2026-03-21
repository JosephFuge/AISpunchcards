import { useTranslation } from "react-i18next";
import { EventCard } from "./eventCard";
import { ClubEvent } from "../models/clubevent";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface EventListProps {
  events: ClubEvent[];
}

export function EventList({ ...EventListProps }) {
  const { t } = useTranslation();
  return (
    <div className="eventListContainer">
      {EventListProps.events.length === 0 && (
        <h3>{t("no_events_to_be_displayed")}</h3>
      )}
      {EventListProps.events.length > 0 &&
        EventListProps.events.map((curEvent: ClubEvent, index: number) => (
          <EventCard key={index} event={curEvent} />
        ))}
    </div>
  );
}
