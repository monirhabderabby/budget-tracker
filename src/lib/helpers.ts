import { Currencies } from "./currency";

export function DateToUTCDate(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

export function GetFormatterForCurrency(currency: string) {
  const locale = Currencies.find((c) => c.value === currency)?.locale;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}

export const getVanilaDateFormat = (dateString: string | null) => {
  if (!dateString) {
    return;
  }
  // Create a Date object from the date string
  const date = new Date(dateString);

  // Extract the day, month, and year
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-indexed in JavaScript, so add 1
  const year = date.getFullYear();

  // Format the values into the desired format
  const formattedDate = `${day}/${month.toString().padStart(2, "0")}/${year}`;

  return formattedDate;
};
