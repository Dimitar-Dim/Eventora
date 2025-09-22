import React from "react";
import type { Event } from "../types/Event";

interface Props {
  events: Event[];
}

const EventList: React.FC<Props> = ({ events }) => {
  return (
    <div>
      <h2>Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.name}</strong> <br />
            {event.eventDate} <br />
            {event.musicType}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};
export default EventList;
