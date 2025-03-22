import styles from "./fileSummary.module.scss";
import { Analysis } from "../state/fileController.ts";
import { Link } from "react-router";
import { formatSeconds } from "../utils/time.ts";
import { formatDate } from "../utils/dates.ts";

type FileSummaryProps = Analysis;

export const FileSummary = ({
  id,
  name,
  duration,
  last_opened_at,
}: FileSummaryProps) => {
  return (
    <Link to={`/analysis/${id}`} className={styles.fileSummary}>
      <div>
        <span>{name}</span>
        <div className={styles.details}>
          <div>{`Duration: ${formatSeconds(duration)}`}</div>
          <div>{`Last opened: ${formatDate(last_opened_at)}`}</div>
        </div>
      </div>
    </Link>
  );
};
