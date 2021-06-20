import en from "javascript-time-ago/locale/en";
import TimeAgo from "javascript-time-ago";

TimeAgo.addDefaultLocale(en);

const formatter = new TimeAgo("en-US");
export function timeAgo(date: Date | number) {
  return formatter.format(date);
}
