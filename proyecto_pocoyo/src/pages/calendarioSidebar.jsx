import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

export default function CalendarioSidebar({ selectedDate, onDateChange }) {
  return (
    <DayPicker
      mode="single"
      selected={selectedDate ? new Date(selectedDate + "T00:00:00") : undefined}
      onSelect={(date) => {
        if (!date) {
          onDateChange("");
          return;
        }

        const localDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        const formattedDate = localDate.toLocaleDateString("en-CA"); // YYYY-MM-DD

        onDateChange(formattedDate);
      }}
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
