const formatTwoNumber = (monthNumber: number): string =>
  `0${monthNumber}`.slice(-2);
export const getDateCalendar = (date: any): string => {
  if (date && date.year && date.month && date.day) {
    return `${date.year}-${formatTwoNumber(date.month)}-${formatTwoNumber(date.day)}`;
  }

  return "";
};

export const convertStringDateToObj = (
  date: string,
  needTransform = false
): string => {
  if (date) {
    let processedDate = date;
    if (needTransform) {
      processedDate = transformDate(processedDate);
    }

    const [y, m, d] = processedDate.split("-");
    return `${y}-${m}-${d}`;
  }
  return "";
};

const transformDate = (date: string): string => {
  return date.replace(/\//g, "-");
};
