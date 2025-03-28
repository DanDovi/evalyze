import { AnalysisEventType } from "../state/fileController.ts";
import { SetStateAction, useCallback } from "react";
import { SelectInput } from "../components/selectInput.tsx";
import { KeySelectInput } from "../components/keySelectInput.tsx";
import { FiPlus, FiTrash } from "react-icons/fi";

import styles from "./createEventTypesForm.module.scss";

export type IEventControl = Omit<AnalysisEventType, "id" | "analysisId"> & {
  formKey: number;
};

interface ICreateEventTypesFormProps {
  events: IEventControl[];
  onEventsChange: (value: SetStateAction<IEventControl[]>) => void;
}

export const validateEvents = (events: Omit<IEventControl, "formKey">[]) => {
  const trimmedNames = events.map((event) =>
    event.name.trim().trim().toLowerCase(),
  );
  const allEventsHaveName = trimmedNames.every((name) => name.length > 0);

  if (!allEventsHaveName) {
    return ["All events must have a name"];
  }

  const namesAreUnique = trimmedNames.every((name, i, arr) => {
    return arr.findIndex((n) => name === n) === i;
  });

  const keysAreUnique = events.every((event, i) => {
    return events.findIndex((e) => e.keyboardKey === event.keyboardKey) === i;
  });

  const errors = [];

  if (!namesAreUnique) {
    errors.push("All event names must be unique");
  }

  if (!keysAreUnique) {
    errors.push("All event keys must be unique");
  }

  return errors;
};

export const CreateEventTypesForm = ({
  events,
  onEventsChange,
}: ICreateEventTypesFormProps) => {
  const onAddEvent = useCallback(() => {
    const maxFormKey = events.reduce((max, event) => {
      return event.formKey > max ? event.formKey : max;
    }, 0);
    onEventsChange([
      ...events,
      {
        name: "",
        keyboardKey: "a",
        category: "single",
        formKey: maxFormKey + 1,
      },
    ]);
  }, [events, onEventsChange]);

  const onDeleteEvent = useCallback(
    (index: number) => {
      onEventsChange((prev) => {
        const newEvents = [...prev];
        newEvents.splice(index, 1);
        return newEvents;
      });
    },
    [onEventsChange],
  );

  return (
    <div className={styles.events}>
      {events.map((event, i) => {
        const { name, keyboardKey, category, formKey } = event;
        const onEventChange = (key: keyof IEventControl, value: string) => {
          onEventsChange((prev) => {
            const newEvents = [...prev];
            newEvents[i] = {
              ...newEvents[i],
              [key]: value,
            };
            return newEvents;
          });
        };

        return (
          <div key={formKey} className={styles.eventRow}>
            <span>
              <label htmlFor={`event.${i}.name`}>Event Name</label>
              <input
                id={`event.${i}.name`}
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => onEventChange("name", e.target.value)}
              />
            </span>
            <span>
              <label htmlFor={`event.${i}.type`}>Event Type</label>
              <SelectInput
                id={`event.${i}.type`}
                value={category}
                onChange={(e) => onEventChange("category", e.target.value)}
              >
                <option key="single" value="single">
                  Single
                </option>
                <option key="range" value="range">
                  Range
                </option>
              </SelectInput>
            </span>
            <span>
              <label htmlFor={`event.${i}.key`}>Event Key</label>
              <KeySelectInput
                id={`event.${i}.key`}
                value={keyboardKey}
                onChange={(e) => onEventChange("keyboardKey", e.target.value)}
              />
            </span>
            <span>
              <button
                className={styles.deleteButton}
                type="button"
                onClick={() => onDeleteEvent(i)}
              >
                <FiTrash size={20} />
              </button>
            </span>
          </div>
        );
      })}
      <button
        className={styles.addEventButton}
        type="button"
        onClick={onAddEvent}
      >
        <span>Add event</span> <FiPlus />
      </button>
    </div>
  );
};
