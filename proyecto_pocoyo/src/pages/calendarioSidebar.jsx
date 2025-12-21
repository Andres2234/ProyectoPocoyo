import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

export default function CalendarioSidebar({ onSelect }) {
  return (
    <DayPicker
      mode="single"
      onSelect={onSelect}
      locale={es}
      styles={{
        caption: { color: "white" },
        head_cell: { color: "#999" },
        cell: { color: "#ccc" },
      }}
      className="calendar-dark"
    />
  );
}

